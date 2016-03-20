var AWS = require('aws-sdk');
AWS.config.region = 'eu-central-1';
var ec2 = new AWS.EC2();
var params = {
};
ec2.describeInstances(params, function(err, data) {
	if (err) { console.log("Something went wrong", err); return; }

	var params = {
		InstanceIds: []
	};

	for (var i = 0; i < data.Reservations.length; i++) {
		for (var j = 0; j < data.Reservations[i].Instances.length; j++) {
			params.InstanceIds.push(data.Reservations[i].Instances[j].InstanceId);
		}
	}
	ec2.startInstances(params, function(err, data) {
		if (err) 
			console.log(err, err.stack);
		else
			console.log(data);
	});
				
});
