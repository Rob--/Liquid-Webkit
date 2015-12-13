// Open debug tools
//require('nw.gui').Window.get().showDevTools();

/* The node add-on used to open the process,
   get the required modules and read/write to memory */
var memoryjs = require('memoryjs');

/* Object storing information about the process */
var _process;

/* Integers storing the base address of the modules */
var _client, _engine;

/* Open the csgo process to find the process id */
memoryjs.openProcess('csgo.exe', function(p){
  _process = p;
  log(`Successfully opened ${p.szExeFile}`, 4000);

  /* Get the address of the client module */
  memoryjs.findModule('client.dll', _process.th32ProcessID, function(m){
    _client = m.modBaseAddr;
    log(`Successfully found ${m.szModule}`, 2000);
  })

  /* Get the address of the engine module */
  memoryjs.findModule('engine.dll', _process.th32ProcessID, function(m){
    _engine = m.modBaseAddr;
    log(`Successfully found ${m.szModule}`, 2000);
  })
});

/* Offsets */
var offsets = {
  dwEntityList: 0x04A587D4,
  dwLocalPlayer: 0x00A6A444,
  dwGlowObject: 0x04B6DA7C,
  iGlowIndex: 0x0000A2E0,
  iTeamNumber: 0x000000F0,
  iHealth: 0x000000FC,
  bDormant: 0x000000E9,
  bSpotted: 0x00000935
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

/* logs to the console and if the duration
   parameter is passed, a toast will be displayed */
function log(string, duration){
  if(arguments.length == 2) Materialize.toast(string, duration);
  console.log(string);
}
