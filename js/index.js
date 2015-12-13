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
    log(`Successfully found ${m.szModule}`, 4000);
  })

  /* Get the address of the engine module */
  memoryjs.findModule('engine.dll', _process.th32ProcessId, function(m){
    _engine = m.modBaseAddr;
    log(`Successfully found ${m.szModule}`, 4000);
  })
});

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
