var w3 = new Web3(votingAppConfig.rpc_url);
var voting_contract = new w3.eth.Contract(votingAppConfig.votingapp_abi_json, votingAppConfig.votingapp_crowdsale_address);
var voterAddress;


function RegisterVoter() {
    console.log("this should register the voter");
    try {
        //check local storage to see if voter has been added
        var voterEthAddr = $("#voterEthAddress").val();
        var registeredVoter = localStorage.getItem(voterEthAddr + "_Voter");
        if (registeredVoter) {
            alert("User has already registered as a Voter");
            $("#voterEthAddress").val("");

        } else {
            //voter needs to be registered since address not found in local storage
            voting_contract.methods.voterRegistration(voterEthAddr)
                .send({ from: voterEthAddr })
                .then(function (data) {
                    localStorage.setItem(voterEthAddr + "_Voter", "voter");
                    alert("Voter registration successfull");
                    $("#voterEthAddress").val("");
                }, function(error){

                    alert("Error occured in voter registration process - " + error);
                    $("#voterEthAddress").val("");
                });
        }


    } catch (exception) {
        alert("Error occured - " + exception);
    }
}

function voterLogin() {

    try {

        var voterKey = $("#voterPrivateKey").val();

        voterAddress = w3.eth.accounts.privateKeyToAccount(voterKey).address;

        if (localStorage.getItem(voterAddress + "_Voter")) {
            //user is a registered voter, take them to the voter options
            $("#voterLogin").fadeOut(1000);
            $("#voterRegistration").fadeOut(1000);
            $("#voterActions").fadeIn(3000);

        } else {
            alert("Voter is not registered, please register voter before logging in");
            $("#voterPrivateKey").val("");
        }

    } catch (exception) {
        alert("Error occured" + exception);
        

    }

}

function CastVote() {

    console.log("This checks to see if the voter is not one of the candidates");
    $("#CastVoteForCandidate").dialog("open");
    

}

function SendVote(){

    var candidateAddress = $("#candidateEthAddressForVote").val();
    //before casting the vote, we have to check for active voting period

    try{

        voting_contract.methods.castMyVote(candidateAddress)
        .send({"from":voterAddress})
        .then(function(){
            alert("Vote successful");
            $("#candidateEthAddressForVote").val("");
            $("#CastVoteForCandidate").dialog("close");
        }, function(error){
            alert("Error occured - " + error);
            $("#candidateEthAddressForVote").val("");
            $("#CastVoteForCandidate").dialog("close");
        });

    }catch(error){

    }


}

function VoterLogOut() {

    $("#voterActions").fadeOut(1000);
    $("#voterLogin").fadeIn(3000);
    $("#voterRegistration").fadeIn(3000);

    $("#voterPrivateKey").val("");


}

function ViewCandidateProfiles(source) {
    console.log("Displays the profiles of the registered candidates");
    switch (source) {
        case "Voter":
            console.log("profiles should be shown as a dialog");
            $("#CandidateProfiles").dialog("open");
            break;

        case "Candidate":
            console.log("profiles should be shown as a div");
            $("#CandidateProfile").show();
            GetCandidates();
            break;

    }


}

