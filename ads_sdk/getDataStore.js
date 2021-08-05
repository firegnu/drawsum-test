window.addEventListener('load', function() {
  var jioConf = { "autoControl": ["volume", "exit"], "gameName": "Drawsum", "gameVersion": "1.1.7" };
  var jioSDK = new Jiogames(jioConf);
  window.jio_gameSDK = jioSDK;
  console.log('.............................................');
  console.log(jioSDK);
  window.jio_SDK = jioSDK;
  var userdata = jioSDK.getVmaxUserData();
  if (userdata != null) {
    console.log("userdata ", userdata);
    window.advid = userdata.idfa ? userdata.idfa : "";
    window.uid = userdata.bpid ? userdata.bpid : "";
    window.advid = '0735043d-42a1-4108-828d-e5bc4f707807';
    window.uid = '5090436833';
  } else {
    console.log('............debugger:can not get userdata!!!');
    window.advid = '0735043d-42a1-4108-828d-e5bc4f707807';
    window.uid = '5090436833';
  }
})
