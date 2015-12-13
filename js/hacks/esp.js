/*
   ESP hack controller
                      */

app.controller('hackESP', ['$scope', function($scope) {
  $scope.ESP = {
    enabled: false,
    target: "ENEMIES",
    full_bloom: false,
    colours: {
      team: {
        hex: "#00ff00",
        r: "0", g: "255", b: "0", a: "100"
      },
      enemy: {
        hex: "#ff0000",
        r: "255", g: "0", b: "0", a: "100"
      },
      editing: "team"
    }
  }

  /* Core ESP hack */
  setInterval(function(){

  }, 10);

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
