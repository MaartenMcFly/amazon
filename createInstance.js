var AWS = require('aws-sdk');
AWS.config.region = 'eu-central-1';
var ec2 = new AWS.EC2();

var userData = new Buffer("#!/bin/bash;sudo yum update -y;");

var params = {
	//ImageId: 'ami-bc5b48d0',
	ImageId: 'ami-87564feb',
	InstanceType: 't2.micro',
	MinCount: 1, MaxCount: 1,
	KeyName: 'id_rsa',
	SecurityGroups: ['ssh','www'],
	UserData: userData.toString('base64')
};

ec2.runInstances(params, function(err, data) {
	if (err) { console.log("Could not create instance", err); return; }

	var instanceId = data.Instances[0].InstanceId;
	params = {
		InstanceIds: [instanceId]
	}
	ec2.waitFor('instanceRunning', params, function(err, data) {
		if (err) {console.log(err, err.stack);return;}

		
		params = {
			InstanceId: instanceId,
			PublicIp: '52.29.235.50',
			AllowReassociation: true,
		};
		ec2.associateAddress(params, function(err, data) {
			if (err) { console.log("Could not associate address", err); return;}

		});
	}); 
	params = {
		InstanceIds: [instanceId]
	};
	ec2.waitFor('instanceRunning', params, function(err,data) {
		if (err) {console.log(err, err.stack);return;}

		params = {
			InstanceId: instanceId
		};
	  	ec2.getConsoleOutput(params, function(err, data) {
			if (err) {console.log(err, err.stack);return;}
	
			console.log(data.Output);
		});
	});	
});
