/*
   No Flash hack controller
                      */

app.controller('hackNoFlash', ['$scope', function($scope) {
  $scope.noflash = {
    enabled: false,
    opacity: 40
  }

  /* Core No Flash hack */
  setInterval(function(){
    if(!$scope.noflash.enabled) return;

    var myPlayer = memoryjs.readMemory(_client + offsets.dwLocalPlayer, 'dword');
    var flashAlpha = memoryjs.readMemory(myPlayer + offsets.flashMaxAlpha, 'float');
    if(flashAlpha > 0){
      memoryjs.writeMemory(myPlayer + offsets.flashMaxAlpha, ($scope.noflash.opacity / 100.0) * 255.0, 'float');
    }

  }, 100);
}]);
