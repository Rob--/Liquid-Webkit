// Open debug tools
//require('nw.gui').Window.get().showDevTools();
var gui = require('nw.gui')

/* The node add-on used to open the process,
   get the required modules and read/write to memory */
var memoryjs = require('memoryjs');

/* Object storing information about the process */
var _process;

/* Integers storing the base address of the modules */
var _client, _engine;

/* Get the CS:GO process */
function openProcess(){
  /* Attempt to open CS:GO, when it's opened and _process is set
     we will attempt to find the modules */
  memoryjs.openProcess('csgo.exe', function(err, p){
    if(err) return setTimeout(openProcess, 100);

    _process = p;
    log(`Successfully opened ${p.szExeFile}`, 5000);
    setTimeout(findModules, 3000); /* delay in finding modules to let the game load */
  });
}

/* Find the modules */
function findModules(){
  memoryjs.findModule('client.dll', _process.th32ProcessID, function(err, m){
    if(err) return setTimeout(findModules, 100);

    _client = m;
    log(`Successfully found ${m.szModule}`, 3000);
  });

  memoryjs.findModule('engine.dll', _process.th32ProcessID, function(err, m){
    if(err) return setTimeout(findModules, 100);

    _engine = m;
    log(`Successfully found ${m.szModule}`, 3000);
  });
}

/* Update vars used for the hacks*/
setInterval(function(){
  localBase = memoryjs.readMemory(_client + offsets.dwLocalPlayer, 'dword');
  /* friendly = my team number */
  friendly = memoryjs.readMemory(localBase + offsets.iTeamNumber, 'int');
  glowPointer = memoryjs.readMemory(_client + offsets.dwGlowObject, 'dword');
}, 500);

/* Intialise any modals */
$('.modal-trigger').leanModal();

/* Initialise angular (separate files for the hacks are
   called individually in the html) */
var app = angular.module('liquid', []);

app.controller('hackLoader', ['$scope', '$interval', '$timeout', function($scope, $interval, $timeout) {
  $scope.loader = {
    loaded : {
      game: false,
      modules: false
    },
    showMainMenu: false,
    info: "Please open CS:GO to continue..."
  };

  /* Call the main function that will
     use recursively call itself until the
     process is opened and the modules found */
  openProcess();

  var check = $interval(function(){
    /* Check if the game has been loaded in
       (check if _process has been defined) */
    $scope.loader.loaded.game = Boolean(_process);

    /* Once the process has been found,
       change the text (there is a purposeful delay
       when opening the process and finding the modues)*/
    if($scope.loader.loaded.game) $scope.loader.info = "Opened CS:GO, finding modules...";

    /* Check if the modules
       have been loaded in */
    $scope.loader.loaded.modules = Boolean(_client) && Boolean(_engine);

    /* After everything has been loaded in,
       cancel the interval */
    if($scope.loader.loaded.game && $scope.loader.loaded.modules) $interval.cancel(check);
  }, 50);
}]);

/* Offsets */
var offsets = {
  dwEntityList: 0x04A587D4,
  dwEnginePointer: 0x6062C4,
  dwLocalPlayer: 0x00A6A444,
  dwGlowObject: 0x04B6DA7C,
  dwActiveWeapon: 0x00002EC8,
  dwWeaponId: 0x32BC,
  dwShotsFired: 0x0000A280,
  dwVecPunch: 0x00002FF8,
  dwSetViewAngle: 0x4D0C,
  dwAmmo: 0x31D4,
  dwJump: 0x04AED310,
  iGlowIndex: 0x0000A2E0,
  iTeamNumber: 0x000000F0,
  iHealth: 0x000000FC,
  bDormant: 0x000000E9,
  bSpotted: 0x00000935,
  flags: 0x100,
  flashMaxAlpha: 0x0000A2C4
}

/* logs to the console and if the duration
   parameter is passed, a toast will be displayed */
function log(string, duration){
  if(arguments.length == 2) Materialize.toast(string, duration);
  console.log(string);
}
