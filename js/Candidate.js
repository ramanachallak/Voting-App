

async function GetCandidates() {

    var candidates = [];
    var CandidateVotes = [];

    var PromiseArray = [];

    for (var i = 0; i < localStorage.length - 1; i++) {

        if (localStorage.key(i).indexOf("Candidate") > -1) {
            
            var candidate_json = JSON.parse(localStorage.getItem(localStorage.key(i)))[0];
            candidates.push(candidate_json);
            await GetNumberOfVotes(candidate_json["CandidateAddress"]).then(function(data){
                console.log("Number of votes returned - " + data);
                CandidateVotes.push({ "label": candidate_json["CandidateAddress"], "y": Number(data), "indexLabel": data});
            });
            
            
        } else {
            console.log("candidate not found");
        }
    }
    
    //console.log(CandidateVotes);
    
    return CandidateVotes;

}

async function GetNumberOfVotes(candidateaddr) {

    var voteCount = 0;

    await voting_contract.methods.getNumberVotes(candidateaddr).call().then(function (votes) {
        //CandidateVotes.push({ "label": candidateaddr, "y": Number(data), "indexLabel": candidateaddr });
        console.log("Number of votes retrieved - " + votes);
        voteCount = votes;
        

    });

    return voteCount;

}

function DisplayGraph(CandidateVotes){

    //var transformedCandidateVotes = 

    var options = {
        animationEnabled: true,
        title: {
            text: "Voting Results",                
            fontColor: "#212121"
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

