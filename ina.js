var INA226 = require('ina226').INA226;
var CONFIGURATION_REGISTER = require('ina226').CONFIGURATION_REGISTER;
var i2cBus = require('i2c-bus').openSync(1);
var addr = 0x40;
var rShunt = 0.002;
var ina = new INA226(i2cBus, addr, rShunt);
var v = 0;
var c = 0;
var p = 0;

module.exports = function(RED)
{
	function inaSensor(config) {
		RED.nodes.createNode(this,config);
		var node = this;
		node.on('input', function(msg) {
			ina.writeRegister(CONFIGURATION_REGISTER, 0x4427)
			.then(function(){
				ina.readBusVoltage()
				.then(function(busVoltage){
				  v = busVoltage.toFixed(2);
				  // console.log(v);
				});
				ina.readShuntVoltage()
				.then(function(){
				  var current = ina.calcCurrent();
				  c = current.toFixed(2);
				  // console.log(c);
				})
				.then(ina.readBusVoltage.bind(ina))
				.then(function(){
				  var power = ina.calcPower();
				  p = power.toFixed(2);
				  // console.log(p);
				});
			});
                        console.log(v + " " + c + " " + p);
			msg.payload = { "v": v, "c": c, "p": p };
            		node.send(msg);
        	});
    	}
	RED.nodes.registerType('ina-sensor', inaSensor)
}
