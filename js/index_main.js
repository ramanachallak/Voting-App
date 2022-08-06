var w3 = new Web3(votingAppConfig.rpc_url);

var voting_contract = new w3.eth.Contract(votingAppConfig.votingapp_abi_json, votingAppConfig.votingapp_crowdsale_address);
var owner_Address;
var voting_start_time;
var voting_end_time;

//Setting the global variables of Contract Owner Address, Voting Start time and Voting End time
voting_contract.methods
    .getOwner()
    .call()
    .then(function (data) {
        owner_Address = data;

    });

voting_contract.methods
    .getStartTime()
    .call()
    .then(function (data) {
        voting_start_time = data;
        localStorage.setItem("Voting Start Time", voting_start_time);

    });

voting_contract.methods
    .getCloseTime()
    .call()
    .then(function (data) {
        voting_end_time = data;
        localStorage.setItem("Voting End Time", voting_end_time);

    });

$(document).ready(function () {

    //Setting the Owner, Candidate and Visitor divs into tabs
    $(function () {
        $("#tabs").tabs();
    });
    
    //Initializing dialog boxes for various actions available for Owners, Candidates and Voters
    InitializeCandidateRegistrationDialog();
    InitializeVotingResultsDialog();
    InitializeCandidateProfileDialog();
    InitializeCandidateProfileUpdateDialog();
    InitializeCandidateVoteDialog();
    


});


//Function to handle owner login
function ownerLogin() {

    try {

        var ownerKey = $("#ownerPrivateKey").val();

        var ownerAddress = w3.eth.accounts.privateKeyToAccount(ownerKey).address;

        if (owner_Address == ownerAddress) {
            $("#ownerActions").fadeIn(3000);
            $("#ownerLogin").fadeOut(1000);

        } else {

            alert("Please provide the correct Owner key");
            $("#ownerPrivateKey").val("");
        }

    } catch (exception) {

        alert("Exception occured - " + exception);
        $("#ownerPrivateKey").val("");

    }



}

function StartElection() {


    //check if voting period is still active
    //if active alert the user 

    var dateTimeNow = ((new Date() - 1) / 1000).toFixed(0);
    var votingStartTime = localStorage.getItem("Voting Start Time");
    var votingEndTime = localStorage.getItem("Voting End Time");
    //if dateTimeNow is greater than voting_start_time and less than voting_end_time, then alert the user 
    //voting session is active
    if (votingEndTime >= dateTimeNow && votingStartTime <= dateTimeNow) {
        alert("Voting session is open, start time should not be changed");

    } else {

        try {

            //Setting start time to datetimenow
            voting_contract.methods
                .setStartTime(dateTimeNow)
                .send({ "from": owner_Address })
                .then(localStorage.setItem("Voting Start Time", dateTimeNow));
            //Setting end time to datetimenow + 5*60 (in seconds) 5 minutes, 300 seconds
            voting_contract.methods
                .setEndTime(Number(dateTimeNow) + 5 * 60 )
                .send({ "from": owner_Address })
                .then(localStorage.setItem("Voting End Time", Number(dateTimeNow) + 5 * 60));

                alert("Voting session is now active");

        } catch (error) {
            alert("Error occured while setting Start Time - " + error);
        }
    }


}
//Function to handle the onclick event of the End Election button. Sets the endtime of the contract to datetimeNow
function EndElection() {

    var dateTimeNow = ((new Date() - 1) / 1000).toFixed(0);

    try{   
     voting_contract.methods
         .setEndTime(Number(dateTimeNow))
         .send({ "from": owner_Address })
         .then(function(){
            localStorage.setItem("Voting End Time", dateTimeNow);
            alert("Election has ended, voters will not be able to cast votes anymore");
         } );

    }catch(error){
        alert("Error occured while setting End Time - " + error);
    }


}

//function to logout the voting authority/contract owner
function ownerLogout() {

    
    $("#ownerLogin").fadeIn(3000);
    $("#ownerActions").fadeOut(1000);
    $("#ownerPrivateKey").val("");



}

function resetFields() {
    
    $("#CandidateRegistration").find("input").each(function (item, htmlelement) { $(htmlelement).val(" "); });
    $("#CandidateRegistration").find("textarea").val(" ");
}

function RegisterCandidate() {

    try{

        var candidateEthAddr = $("#candidateEthAddress").val();
    var candidatePhotoLocation = $("#candidatePhoto").val();
    var candidateStrengthsValue = $("#candidateStrengths").val();
    var candidateJson = [{ "CandidateAddress": candidateEthAddr, "CandidatePhoto": candidatePhotoLocation, "CandidateStrengths": candidateStrengthsValue }];
    var candidateString = JSON.stringify(candidateJson);
    var ownerKey = $("#ownerPrivateKey").val();

    if (localStorage.getItem(candidateEthAddr + "_Candidate")) {

        alert("Candidate has been registered");
        $("#CandidateRegistration").dialog("close");

    } else {

        var ownerAddress = w3.eth.accounts.privateKeyToAccount(ownerKey).address;
        voting_contract.methods.candidateRegistration(candidateEthAddr)
            .send({ from: ownerAddress })
            .then(function (data) {
                alert("Candidate Registration complete");
                //console.log(data);
                $("#CandidateRegistration").dialog("close");
                localStorage.setItem(candidateEthAddr + "_Candidate", candidateString);
            }, function (data) {
                alert("Candidate Registration failed");
                //console.log(data);
                $("#CandidateRegistration").dialog("close");
            });

    }


    }catch(error){

        alert("Error occured in Candidate registration - " + error);

    }
    

}

function InitializeCandidateVoteDialog() {

    $("#CastVoteForCandidate").dialog({
        autoOpen: false,
        height: 350,
        width: "50%",
        modal: true,
        title: "Cast Vote",
        buttons: {
            "Vote": SendVote,
            Cancel: function () {
                $("#candidateEthAddressForVote").val("");
                $("#CastVoteForCandidate").dialog("close");
            }
        },
        //close: resetFields,
        show: {
            effect: "fadeIn",
            duration: 1000
        },
        hide: {
            effect: "fadeOut",
            duration: 1000
        }
    });

}

function InitializeCandidateRegistrationDialog() {
    $("#CandidateRegistration").dialog({
        autoOpen: false,
        height: 350,
        width: "50%",
        modal: true,
        title: "Candidate Registration",
        buttons: {
            "Register Candidate": RegisterCandidate,
            Cancel: function () {

                $("#CandidateRegistration").dialog("close");
            }
        },
        close: resetFields,
        show: {
            effect: "fadeIn",
            duration: 1000
        },
        hide: {
            effect: "fadeOut",
            duration: 1000
        }
    });
}

function InitializeVotingResultsDialog() {
    $("#VotingResults").dialog({
        autoOpen: false,
        height: 450,
        width: 1000,
        modal: true,
        title: "Voting Results",
        buttons: {

            "Close": function () { $("#VotingResults").dialog("close"); }
        },
        close: resetFields,
        show: {
            effect: "fadeIn",
            duration: 1000
        },
        hide: {
            effect: "fadeOut",
            duration: 1000
        }
    });
}

function InitializeCandidateProfileDialog() {
    $("#CandidateProfiles").dialog({
        autoOpen: false,
        height: 550,
        width: 1100,
        modal: true,
        title: "Candidate Profiles",
        buttons: {

            "Close": function () { $("#CandidateProfiles").html(""); $("#CandidateProfiles").dialog("close"); }
        },

        show: {
            effect: "fadeIn",
            duration: 1000
        },
        hide: {
            effect: "fadeOut",
            duration: 1000
        }
    });

}

function  InitializeCandidateProfileUpdateDialog(){
    $("#CandidateProfile").dialog({
        autoOpen: false,
        height: 500,
        width: 700,
        modal: true,
        title: "Update Candidate Profile",
        buttons: {
            "Update Profile": UpdateProfile,
            "Close": function () { $("#CandidateProfile").dialog("close"); }
        },

        show: {
            effect: "fadeIn",
            duration: 1000
        },
        hide: {
            effect: "fadeOut",
            duration: 1000
        }
    });
}

function showResults() {

    $("#VotingResults").dialog("open");
    GetCandidates().then(function(CandidateVotes){

        DisplayGraph(CandidateVotes);

    });

}
function openCandidateRegistrationForm() {

    $("#CandidateRegistration").dialog("open");

}

