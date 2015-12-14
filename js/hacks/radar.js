/*
   Radar hack controller
                      */

app.controller('hackRadar', ['$scope', function($scope) {
  $scope.radar = {
    enabled: false
  }

  /* Core Radar hack */
  setInterval(function(){
    if(!$scope.radar.enabled) return;

    /* Loop over every possible player and
       set 'spotted' to true */
    for(var i = 0; i < 64; i++){
      /* 0x10 is the size of the entity in the list */
		  var cPlayer = memoryjs.readMemory(_client + offsets.dwEntityList + i * 0x10, 'dword');
      var cPlayerDormant = memoryjs.readMemory(cPlayer + offsets.bDormant, 'boolean');

      /* dormant check to determine whether or not the player is a real player */
      if(cPlayerDormant) continue;

      /* if they haven't been spotted, set 'spotted' to true */
      if (!memoryjs.readMemory(cPlayer + offsets.bSpotted, 'boolean')) {
			     memoryjs.writeMemory(cPlayer + offsets.bSpotted, 1, 'int');
		  }
    }

  }, 10);
}]);
