var w3 = new Web3(votingAppConfig.rpc_url);
var voting_contract = new w3.eth.Contract(votingAppConfig.votingapp_abi_json, votingAppConfig.votingapp_crowdsale_address);
var candidateAddress;

async function GetCandidates() {

    var candidates = [];
    var CandidateVotes = [];

    var PromiseArray = [];
    var candidateCount = 0;

    for (var i = 0; i < localStorage.length; i++) {

        if (localStorage.key(i).indexOf("Candidate") > -1) {
            candidateCount = candidateCount +1;
            var candidate_json = JSON.parse(localStorage.getItem(localStorage.key(i)))[0];
            //candidates.push(candidate_json);
            await GetNumberOfVotes(candidate_json["CandidateAddress"]).then(function(data){
                //console.log("Number of votes returned - " + data);
                //CandidateVotes.push({ "label": candidate_json["CandidateAddress"], "y": Number(data), "indexLabel": data});
                CandidateVotes.push({ "label": candidate_json["CandidateName"], "y": Number(data), "indexLabel": data});
            });
            
            
        } else {
            //console.log("candidate not found");
        }
    }
    
    //console.log(CandidateVotes);
    
    return CandidateVotes;

}

async function GetNumberOfVotes(candidateaddr) {

    var voteCount = 0;

    await voting_contract.methods.getNumberVotes(candidateaddr).call().then(function (votes) {
        //CandidateVotes.push({ "label": candidateaddr, "y": Number(data), "indexLabel": candidateaddr });
        //console.log("Number of votes retrieved - " + votes);
        voteCount = votes;
        

    });

    return voteCount;

}

function DisplayGraph(CandidateVotes){

    //var transformedCandidateVotes = 

    var options = {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: "Voting Results",                
            //fontColor: "#212121"
            //fontColor: "#a9a9a9"
        },	
        axisY: {
            tickThickness: 0,
            lineThickness: 0,
            valueFormatString: " ",
            includeZero: true,
            gridThickness: 0                    
        },
        axisX: {
            tickThickness: 0,
            lineThickness: 0,
            labelFontSize: 14,
            labelFontColor: "#212121"				
        },
        data: [{
            indexLabelFontSize: 14,
            toolTipContent: "<span style=\"color:#007fff\">{label}:</span> <span style=\"color:red\"><strong>{y}</strong></span>",
            indexLabelPlacement: "inside",
            indexLabelFontColor: "white",
            indexLabelFontWeight: 600,
            indexLabelFontFamily: "Verdana",
            color: "#007fff",
            type: "bar",
            dataPoints: CandidateVotes  
        }]
    };

    $("#VotingResults").CanvasJSChart(options);

}

function candidateLogin(){
    try {

        var candidateKey = $("#candidatePrivateKey").val();

        candidateAddress = w3.eth.accounts.privateKeyToAccount(candidateKey).address;

        if (localStorage.getItem(candidateAddress + "_Voter")) {
            //user is a registered voter, take them to the voter options
            $("#candidatePrivateKey").val("");
            $("#candidateLogin").fadeOut(1000);            
            $("#candidateActions").fadeIn(3000);
            

        } else {
            alert("Candidate is not registered!");
            $("#candidatePrivateKey").val("");
        }

    } catch (exception) {
        alert("Error occured" + exception);
        

    }
}

function UpdateProfile(){

    var candidateJson = JSON.parse(localStorage.getItem(candidateAddress + "_Candidate"))[0];
    var candidatePhotoLocation = $("#candidateProfilePhoto").val();
    var candidateStrengthsValue = $("#candidateProfileStrengths").val();
    var candidateNamevalue = $("#candidateName").val();

    candidateJson.CandidatePhoto = candidatePhotoLocation;
    candidateJson.CandidateStrengths = candidateStrengthsValue;
    candidateJson.CandidateName = candidateNamevalue;

    var candidateJsonString = JSON.stringify([candidateJson]);
    
    localStorage.setItem(candidateAddress+"_Candidate", candidateJsonString);
    $("#candidateProfilePhoto").val("");
    $("#candidateProfileStrengths").val("");
    $("#candidateName").val("");

    $("#CandidateProfile").dialog("close");

}

function UpdateCandidateProfile(){
    $("#CandidateProfile").dialog("open");
    GetCandidateInformation(candidateAddress);
}

function LogOutCandidate(){

    $("#candidateActions").fadeOut(1000);
    $("#candidateLogin").fadeIn(3000);            
    

}

function GetCandidateInformation(address){
    var candidateJson = JSON.parse(localStorage.getItem(address + "_Candidate"))[0];

    $("#candidateProfilePhoto").val(candidateJson.CandidatePhoto);
    $("#candidateProfileStrengths").val(candidateJson.CandidateStrengths);
    $("#candidateName").val(candidateJson.CandidateName);
}

