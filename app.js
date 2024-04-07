//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
const crypto = require('crypto');

// Token generated by Teams 
const sharedSecret = "brKo3n0jYemTEweCAbYZeEBW1SR4quhzD8f0ISZv1CU=";
const bufSecret = Buffer.from(sharedSecret, "base64");

const InitialSquads = ["Alchemist", "Invoker", "Jugg", "Riki", "Spectre", "Tiny"];
const StartSchedule = new Date(2024, 0, 1);
const SquadsMembers = {
    "Tiny": ["HeathSD", "HieuVM13", "DungLM11"],
    "Spectre": ["GiangPT14", "AnhHTV8", "LinhNVH3"],
    "Jugg": ["TungND27", "HuyNQ101", "QuangPNT1"],
    "Riki": ["DatPT45", "LoiNC1", "KienDT36", "HieuVD21"],
    "Alchemist": ["HieuTT45", "LongLN4", "DucNT118"],
    "Invoker": ["TungNT108", "SonNT87", "HuynhPT5"]
};

function findScheduleByDate(numDays) {
    const targetSquads = [];
    targetSquads.push(...InitialSquads.slice(InitialSquads.length - numDays % InitialSquads.length));
    targetSquads.push(...InitialSquads.slice(0, InitialSquads.length - numDays % InitialSquads.length));
    return targetSquads;
}

function handleNowCommand(shift = null) {
    const targetDate = new Date();
    targetDate.setUTCHours(targetDate.getUTCHours() + 7);
    console.log(targetDate);
    const targetTime = targetDate.getTime(); 
    console.log(targetTime);

    const shifts = ["1:00", "9:00", "13:00", "17:00", "21:00", "23:59"];
    const numDays = Math.floor((targetDate - StartSchedule) / (1000 * 60 * 60 * 24));

    const targetSchedule = findScheduleByDate(numDays);
    if (shift === null) {
        let currentShift = 5;
        for (let i = 0; i < shifts.length - 1; i++) {
            const [hours, minutes] = shifts[i].split(":").map(Number);

            const startTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hours, minutes);
            const endTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), Number(shifts[i + 1].split(":")[0]), Number(shifts[i + 1].split(":")[1]));
            if (targetTime >= startTime.getTime() && targetTime < endTime.getTime()) {
                currentShift = i;
                break;
            }
        }
        return `${targetSchedule[currentShift]} - ${SquadsMembers[targetSchedule[currentShift]].join(", ")}`;
    } else {
        return `${targetSchedule[shift]} - ${SquadsMembers[targetSchedule[shift]].join(", ")}`;
    }
}

function handleDateCommand(dateString) {
    var match = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    var targetSchedule = "";
    if (match) {
        var day = parseInt(match[1]);
        var month = parseInt(match[2]) - 1; 
        var year = parseInt(match[3]);

        const dateObject = new Date(year, month, day);
        console.log(dateObject); 
        dateObject.setHours(0, 0, 0, 0);

        const numDays = Math.floor((dateObject - StartSchedule) / (1000 * 60 * 60 * 24));

        targetSchedule = findScheduleByDate(numDays).slice(0, 5);
    } else {
        targetSchedule = "Received text is not a valid date";
    }
    return targetSchedule;

}


function handleTodayCommand() {
    const today = new Date();
    today.setUTCHours(today.getUTCHours() + 7);
    today.setHours(0, 0, 0, 0);

    const numDays = Math.floor((today - StartSchedule) / (1000 * 60 * 60 * 24));

    const targetSchedule = findScheduleByDate(numDays).slice(0, 5);
    return targetSchedule;
}


var http = require('http');
var PORT = process.env.port || process.env.PORT || 3978;
http.createServer(function (request, response) {
    var payload = '';
    // Process the request
    request.on('data', function (data) {
        payload += data;
    });

    // Respond to the request
    request.on('end', function () {
        try {
            // Retrieve authorization HMAC information
            var auth = this.headers['authorization'];
            // Calculate HMAC on the message we've received using the shared secret			
            var msgBuf = Buffer.from(payload, 'utf8');
            var msgHash = "HMAC " + crypto.createHmac('sha256', bufSecret).update(msgBuf).digest("base64");
            response.writeHead(200);
            if (msgHash === auth) {
                var receivedMsg = JSON.parse(payload);

                // The text received to webhook
                var receivedText = receivedMsg.text;
                console.log(receivedText);

                // The message sent by webhook
                var responseMsg = '';
                switch (true) {
                    case (receivedText.indexOf("today") != -1):
                        shift_detail=handleTodayCommand();
                        // Creating adaptive card response
                        responseMsg = JSON.stringify({
                            "type": "message",
                            "attachments": [
                                {
                                    "contentType": "application/vnd.microsoft.card.adaptive",
                                    "contentUrl": null,
                                    "content": {
                                        "type": "AdaptiveCard",
                                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                                        "version": "1.5",
                                        "body": [
                                            {
                                                "type": "FactSet",
                                                "facts": [
                                                    {
                                                        "title": "Shift 1",
                                                        "value": shift_detail[0] + " - "+ SquadsMembers[shift_detail[0]].join(", ")
                                                    },
                                                    {
                                                        "title": "Shift 2",
                                                        "value": shift_detail[1] + " - "+SquadsMembers[shift_detail[1]].join(", ")
                                                    },
                                                    {
                                                        "title": "Shift 3",
                                                        "value": shift_detail[2] + " - "+SquadsMembers[shift_detail[2]].join(", ")
                                                    },
                                                    {
                                                        "title": "Shift 4",
                                                        "value": shift_detail[3] + " - "+SquadsMembers[shift_detail[3]].join(", ")
                                                    },
                                                    {
                                                        "title": "Shift 5",
                                                        "value": shift_detail[4] + " - "+SquadsMembers[shift_detail[4]].join(", ")
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    "name": null,
                                    "thumbnailUrl": null
                                }
                            ]
                        });
                        break;
                    case (receivedText.indexOf("now") != -1):
                        shift_detail=handleNowCommand();
                        // Creating adaptive card response
                        responseMsg = JSON.stringify({
                            "type": "message",
                            "attachments": [
                                {
                                    "contentType": "application/vnd.microsoft.card.adaptive",
                                    "contentUrl": null,
                                    "content": {
                                        "type": "AdaptiveCard",
                                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                                        "version": "1.6",
                                        "body": [
                                            {
                                                "type": "TextBlock",
                                                "text": shift_detail,
                                                "wrap": true,
                                                "weight": "Bolder"
                                            }
                                        ]
                                    },
                                    "name": null,
                                    "thumbnailUrl": null
                                }
                            ]
                        });
                        break;
                    case (receivedText.includes("/") && receivedText.split("/").length > 3):
                        shift_detail=handleDateCommand(receivedText);
                        // Creating adaptive card response
                        responseMsg = JSON.stringify({
                            "type": "message",
                            "attachments": [
                                {
                                    "contentType": "application/vnd.microsoft.card.adaptive",
                                    "contentUrl": null,
                                    "content": {
                                                            "type": "AdaptiveCard",
                                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                                        "version": "1.5",
                                        "body": [
                                            {
                                                "type": "FactSet",
                                                "facts": [
                                                    {
                                                        "title": "Shift 1",
                                                        "value": shift_detail[0] + " - "+ SquadsMembers[shift_detail[0]].join(", ")
                                                    },
                                                    {
                                                        "title": "Shift 2",
                                                        "value": shift_detail[1] + " - "+SquadsMembers[shift_detail[1]].join(", ")
                                                    },
                                                    {
                                                        "title": "Shift 3",
                                                        "value": shift_detail[2] + " - "+SquadsMembers[shift_detail[2]].join(", ")
                                                    },
                                                    {
                                                        "title": "Shift 4",
                                                        "value": shift_detail[3] + " - "+SquadsMembers[shift_detail[3]].join(", ")
                                                    },
                                                    {
                                                        "title": "Shift 5",
                                                        "value": shift_detail[4] + " - "+SquadsMembers[shift_detail[4]].join(", ")
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    "name": null,
                                    "thumbnailUrl": null
                                }
                            ]
                        });
                        break;
                    default:
                        // Sending plain text as response message	
                        responseMsg = '{ "type": "message", "text": "**You typed**: ' + receivedMsg.text + ' \n **Commands supported**: today, now " }';
                        break;
                }
            } else {
                var responseMsg = '{ "type": "message", "text": "Error: message sender cannot be authenticated." }';
            }
            response.write(responseMsg);
            response.end();
        } catch (err) {
            response.writeHead(400);
            return response.end("Error: " + err + "\n" + err.stack);
        }
    });

}).listen(PORT, error => {
    if (error) {
        console.log(error);
        return process.exit(1);
    } else {
        console.log('Listening on port: %s', PORT);
    }
});