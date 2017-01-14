var AWS = require('aws-sdk');
AWS.config.loadFromPath('./minecraft-config.json');
var ec2 = new AWS.EC2();
var userData = new Buffer("#!/bin/bash;sudo yum update -y;");

var params = {
	InstanceCount: 1,
	LaunchSpecification: {
		ImageId: 'ami-3efe3251',
		InstanceType: 'm3.medium',
		KeyName: 'Minecraft',
		SecurityGroups: ['sgMinecraft'],
		UserData: userData.toString('base64')
	},
	SpotPrice: "0.050",
	Type: "one-time"
};

ec2.requestSpotInstances(params, function(err, data) {
	if (err) console.log(err, err.stack);
	else {
		var requestId = data.SpotInstanceRequests[0].SpotInstanceRequestId;
		params = { SpotInstanceRequestIds: [requestId] };
		ec2.waitFor('spotInstanceRequestFulfilled', params, function(err, data) {
			if (err) console.log(err, err.stack);
			else {
				var instanceId = data.SpotInstanceRequests[0].InstanceId;

				params = {
					InstanceIds: [instanceId]
				}
				ec2.waitFor('instanceRunning', params, function(err, data) {
					if (err) console.log(err, err.stack);
					else {
						console.log("Id is " + instanceId);
						params = {Resources: [instanceId], Tags: [{Key: 'Name', Value: 'Minecraft server'}]};
						ec2.createTags(params, function(err) {
							console.log("Tagging instance ", err ? "failure" : "success");
						});
						params = {
							InstanceId: instanceId,
							PublicIp: '52.59.3.73',
							AllowReassociation: true,
						};
						ec2.associateAddress(params, function(err, data) {
							if (err) console.log(err, err.stack);
							else console.log(data);
						});
					}
				});
			}});
		}
	});
/*
ec2.runInstances(params, function(err, data) {
	if (err) { console.log("Could not create instance", err); return; }

	var instanceId = data.Instances[0].InstanceId;

	params = {Resources: [instanceId], Tags: [{Key: 'Name', Value: 'Minecraft server'}]};
	ec2.createTags(params, function(err) {
		console.log("Tagging instance ", err ? "failure" : "success");
	});

	params = {
		InstanceIds: [instanceId]
	}
	ec2.waitFor('instanceRunning', params, function(err, data) {
		if (err) {console.log(err, err.stack);return;}


		params = {
			InstanceId: instanceId,
			PublicIp: '52.59.3.73',
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
});*/
