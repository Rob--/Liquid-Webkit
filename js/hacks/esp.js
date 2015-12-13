/*
   ESP hack controller
                      */

app.controller('hackESP', ['$scope', function($scope) {
  $scope.ESP = {
    enabled: false,
    target: "ENEMIES",
    fullBloom: false,
    glowItems: true,
    colours: {
      team: {
        hex: "#00ff00",
        r: "0", g: "255", b: "0", a: "100"
      },
      enemy: {
        hex: "#ff0000",
        r: "255", g: "0", b: "0", a: "100"
      },
      item: {
        hex: "#0099cc",
        r: "0", g: "153", b: "204", a: "100"
      },
      editing: "team",
      healthBased: true
    },
    changeSpottedAlpha: {
      enabled: true,
      to: 100
    }
  }

  /* Core ESP hack */
  setInterval(function(){
    if(!$scope.ESP.enabled) return;

    /* Player and Item Glow */
    var objectCount = memoryjs.readMemory(_client + offsets.dwGlowObject + 0x4, 'int');
    for(var i = 0; i < objectCount; i++){

      /* Weapon ESP */

      /* gets the base of the entity, reads 4 bytes at the start
        of each entity in memory (first 4 bytes are the base) */
      var entityDwBase = memoryjs.readMemory(glowPointer + i * 0x38, 'dword');
      var entityDormant = memoryjs.readMemory(entityDwBase + offsets.bDormant, 'boolean');

      var vt = memoryjs.readMemory(entityDwBase + 0x8, 'int'); //to get pointer to its IClientNetworkable vtable
      var fn = memoryjs.readMemory(vt + 2 * 0x4, 'int'); // to get the pointer to the 3rd function in the vtable(GetClientClass)
      var cls = memoryjs.readMemory(fn + 1, 'int'); // to rip the pointer to the ClientClass struct (look up in the sdk) out of the mov eax, offset <entity's client class>
      var classid = memoryjs.readMemory(cls + 20, 'int');

      if($scope.ESP.glowItems && isWeapon(classid) && !entityDormant) drawGlowEntity(i, getColour(100, false, "item"));

      /* Player ESP */

      /* 0x10 is the size of the entity in the list */
		  var cPlayer = memoryjs.readMemory(_client + offsets.dwEntityList + i * 0x10, 'dword');
      var cPlayerDormant = memoryjs.readMemory(cPlayer + offsets.bDormant, 'boolean');

      // dormant check to determine whether or not the player is a real player
      if(cPlayerDormant) continue;

		  var cPlayerTeam = memoryjs.readMemory(cPlayer + offsets.iTeamNumber, 'int');
      var cPlayerGlowIndex = memoryjs.readMemory(cPlayer + offsets.iGlowIndex, 'int');
			var cPlayerHealth = memoryjs.readMemory(cPlayer + offsets.iHealth, 'int');
      var cPlayerSpotted = memoryjs.readMemory(cPlayer + offsets.bSpotted, 'boolean');

      /* 2 == Terrorists, 3 == Counter Terrorists,
         check if the entity is an item or not */

      var isEnemy = (cPlayerTeam == 2 || cPlayerTeam == 3) && cPlayerTeam != friendly;

      /* check who we're supposed to make glow
         and check which team the current player is on */
      if($scope.ESP.target == 'ENEMIES' && isEnemy){
        drawGlowEntity(cPlayerGlowIndex, getColour(cPlayerHealth, cPlayerSpotted, 'enemy'));
      } else if ($scope.ESP.target == 'FRIENDLIES' && !isEnemy){
        drawGlowEntity(cPlayerGlowIndex, getColour(cPlayerHealth, cPlayerSpotted, 'team'));
      } else if($scope.ESP.target == 'BOTH'){
        drawGlowEntity(cPlayerGlowIndex, getColour(cPlayerHealth, cPlayerSpotted, isEnemy ? 'enemy' : 'team'));
      }
    }

  }, 1);

  /* Writes to memory to make a player glow */
  function drawGlowEntity(glowIndex, colour){
    //alert(JSON.stringify(colour));
    /* hex goes up by the size of the data type (e.g. float is 4, boolean is 1),
  	   0x38 is the size of the structure for glowing the player (a, r, g, b, etc...) */
  	memoryjs.writeMemory(glowPointer + ((glowIndex * 0x38) + 0x4), colour.r, 'float');
  	memoryjs.writeMemory(glowPointer + ((glowIndex * 0x38) + 0x8), colour.g, 'float');
  	memoryjs.writeMemory(glowPointer + ((glowIndex * 0x38) + 0xC), colour.b, 'float');
  	memoryjs.writeMemory(glowPointer + ((glowIndex * 0x38) + 0x10), colour.a, 'float');

    /* this line can be used to edit the full bloom percentage (and we could add a toggle in the interface and property
       in the ESP object), but this is essentially just the same as editing the opacity and the result is identical
    memoryjs.writeMemory(glowPointer + ((glowIndex * 0x38) + 0x1C), ($scope.ESP.fullBloom.percentage / 100.0) * 1.4, 'float');
    */

    /* first line is render when occluded, second line is render when unoccluded */
  	memoryjs.writeMemory(glowPointer + ((glowIndex * 0x38) + 0x24), true, 'boolean');
  	memoryjs.writeMemory(glowPointer + ((glowIndex * 0x38) + 0x25), false, 'boolean');
    memoryjs.writeMemory(glowPointer + ((glowIndex * 0x38) + 0x26), $scope.ESP.fullBloom, 'boolean');
  }

  /* gets the rgab values for a given side */
  function getColour(health, spotted, side) {
    if($scope.ESP.colours.healthBased && side != "item"){
      var colour = {
        r: 1.4 - ((health / 100.0) * 1.4),
        g: ((health * 0.5) / 100.0) * 1.0,
        b: 0.0,
        a: ($scope.ESP.colours[side].a / 100) * 1.4
      };
    } else {
      var colour = {
        r: ($scope.ESP.colours[side].r / 255) * 1.4,
        g: ($scope.ESP.colours[side].g / 255) * 1.4,
        b: ($scope.ESP.colours[side].b / 255) * 1.4,
        a: ($scope.ESP.colours[side].a / 100) * 1.4
      }
    }
    
    if($scope.ESP.changeSpottedAlpha.enabled && spotted) colour.a *= $scope.ESP.changeSpottedAlpha.to / 100.0;
    return colour;
  }

  /* id = classid */
  function isWeapon(id) {
    return [1, 8, 9, 13, 29, 31, 39, 40, 41, 64, 82, 83, 84, 89, 90, 93, 94, 104,
       115, 122, 126, 127, 176, 197, 198, 199, 200, 201, 203, 204, 205, 206, 207,
       208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222,
       223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 240]
       .indexOf(id) != -1;
  }

  /* Sets the glow targets (team, enemy, both),
  called when the option buttons are clicked */
  $scope.setTarget = function($event, target){
    $scope.ESP.target = target;
  }

  /* Sets the button classes, this lets a currently
  selected option appear as green instead of white */
  $scope.setButtonClass = function(target){
    return target == $scope.ESP.target ? '' : 'btn-white';
  }

  /* Converts the rgba values
  stored to a CSS compatible string */
  $scope.getColourString = function(side){
    var colour = $scope.ESP.colours[side];
    return `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a / 100})`
  }

  /* Converts rgba values to hex
     http://stackoverflow.com/a/5624139/5631268 */
  $scope.rgbaToHex = function(side){
    var colour = $scope.ESP.colours[side];
    return "#" + ((1 << 24) + (Number(colour.r) << 16) + (Number(colour.g) << 8) + Number(colour.b)).toString(16).slice(1);
  }

}]);
