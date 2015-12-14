/*
   No Recoil hack controller
                      */

app.controller('hackNoRecoil', ['$scope', function($scope) {
  $scope.norecoil = {
    enabled: false,
    accuracy: 100,
    autoFiring: false,
    previousPunch: {
      x: 0, y: 0, z: 0
    }
  }

  /* Core No Recoil hack */
  setInterval(function(){
    if(!$scope.norecoil.enabled) return;

    var myPlayer = memoryjs.readMemory(_client + offsets.dwLocalPlayer, 'dword');
    var engine = memoryjs.readMemory(_engine + offsets.dwEnginePointer, 'dword');

    var weapon = memoryjs.readMemory(myPlayer + offsets.dwActiveWeapon, 'dword');

    var weaponBase = memoryjs.readMemory(_client + offsets.dwEntityList + (weapon & 0xFFF - 1) * 0x10, 'dword');
    var weaponId = memoryjs.readMemory(weaponBase + offsets.dwWeaponId, 'int');

    var ammo = memoryjs.readMemory(weaponBase + offsets.dwAmmo, 'int');
    var health = memoryjs.readMemory(myPlayer + offsets.iHealth, 'int');

    if(!health > 0 && !health < 7400000 && isOneTapWeapon(weaponId)) return;

    var shotsFired = memoryjs.readMemory(myPlayer + offsets.dwShotsFired, 'int');

    /* Current punch coordinated */
    var punch = {
      x: memoryjs.readMemory(myPlayer + offsets.dwVecPunch, 'float'),
      y: memoryjs.readMemory(myPlayer + offsets.dwVecPunch + 0x4, 'float'),
      z: memoryjs.readMemory(myPlayer + offsets.dwVecPunch + 0x8, 'float')
    }

    punch.x *= 1.0 + ($scope.norecoil.accuracy / 100.0);
    punch.y *= 1.0 + ($scope.norecoil.accuracy / 100.0);

    /* Check if auto firing because when writing to memory
		   to shoot, the shotsFiredCount doesn't increase and therefore
			 when using trigger bot we need to manually
		   identify if we've been shooting. */
		if (shotsFired > 1 || $scope.norecoil.autoFiring) {
      /* Modified coordinates, this eliminates recoil
         and is used as a base when writing the coordinates */
      var modifier = {
        x: punch.x - $scope.norecoil.previousPunch.x,
        y: punch.y - $scope.norecoil.previousPunch.y,
        z: punch.x
      }

      /* Gets the view angle and eliminates the modifier coordinates
         these are the view angles for the player */
      var angles = {
        x: memoryjs.readMemory(engine + offsets.dwSetViewAngle, 'float') - modifier.x,
        y: memoryjs.readMemory(engine + offsets.dwSetViewAngle + 0x4, 'float') - modifier.y,
        z: 0
      }

      if(!isFinite(angles.x)) angles.x = 0;
      if(!isFinite(angles.y)) angles.y = 0;

      while(angles.y < -180.0) angles.y += 360.0;
      while(angles.y > 180.0) angles.y -= 360.0;
      if(angles.x > 89.0) angles.x = 89.0;
      if(angles.x < -89.0) angles.x = -89.0;

      memoryjs.writeMemory(engine + offsets.dwSetViewAngle, angles.x, 'float');
      memoryjs.writeMemory(engine + offsets.dwSetViewAngle + 0x4, angles.y, 'float');
      memoryjs.writeMemory(engine + offsets.dwSetViewAngle + 0x8, angles.z, 'float');
    }

    $scope.norecoil.previousPunch = punch;
  }, 10);

  /* id = classid, determines
     whether or not a given classid
     is a one tap weapon (pistol, etc) */
  function isOneTapWeapon(id) {
    return [1, 2, 3, 4, 9, 11, 25, 27, 29, 30, 31, 32, 35, 38, 40, 42, 43, 44, 45, 46, 47, 48, 49]
      .indexOf(id) != -1;
  }
}]);
