/*
   Bunnyhop hack controller
                      */
var liquid = require('liquid-assistance');

app.controller('hackBhop', ['$scope', function($scope) {
  $scope.bhop = {
    enabled: false
  }

  /* Core Bunnyhop hack */
  setInterval(function(){
    if(!$scope.bhop.enabled) return;

    if(liquid.holdingSpace()){
      var myPlayer = memoryjs.readMemory(_client + offsets.dwLocalPlayer, 'dword');
      var flags = memoryjs.readMemory(myPlayer + offsets.flags, 'dword');
      if(flags & 0x1 == 1){
        memoryjs.writeMemory(_client + offsets.dwJump, 5, 'int');
        setTimeout(function(){
          memoryjs.writeMemory(_client + offsets.dwJump, 4, 'int');
        }, 50);
      }
    }
  }, 10);
}]);
