Commandline options
This is an overview of the command line options available to control how JsDoc Toolkit works.

Note: On the Windows OS the filepaths will have back-slashes; On Mac OS X and Linux the filepaths will have forward-slashes. You should adjust the examples here to suit your own OS.

Windows    C:\path\to\my\file.js
Mac OS X   /path/to/my/file.js
Linux      /path/to/my/file.js
Note: As of version 2.0, it is no longer necessary to change your current working directory to the jsdoc-toolkit folder. For brevity, all the examples on this page assume your current working directory is jsdoc-toolkit, but you should adjust the paths to match your own environment.

Options
All options are either in the form of -x or -x=value. (Note that spaces are not permited around the equals sign when it is used.) The order of options are generally irrelevant.

  -a or --allfunctions
          Include all functions, even undocumented ones.

  -c or --conf
          Load a configuration file.

  -d=<PATH> or --directory=<PATH>
          Output to this directory (defaults to "out").

  -D="myVar:My value" or --define="myVar:My value"
          Multiple. Define a variable, available in JsDoc as JSDOC.opt.D.myVar.

  -e=<ENCODING> or --encoding=<ENCODING>
          Use this encoding to read and write files.

  -E="REGEX" or --exclude="REGEX"
          Multiple. Exclude files based on the supplied regex.

  -h or --help
          Show this message and exit.

  -n or --nocode
          Ignore all code, only document comments with @name tags.

  -o=<PATH> or --out=<PATH>
          Print log messages to a file (defaults to stdout).

  -p or --private
          Include symbols tagged as private, underscored and inner symbols.

  -q or --quiet
          Do not output any messages, not even warnings.

  -r=<DEPTH> or --recurse=<DEPTH>
          Descend into src directories.

  -s or --suppress
          Suppress source code output.

  -S or --securemodules
          Use Secure Modules mode to parse source code.

  -t=<PATH> or --template=<PATH>
          Required. Use this template to format the output.

  -T or --test
          Run all unit tests and exit.

  -u or --unique
          Force file names to be unique, but not based on symbol names.

  -v or --verbose
          Provide verbose feedback about what is happening.

  -x=<EXT>[,EXT]... or --ext=<EXT>[,EXT]...
          Scan source files with the given extension/s (defaults to js).
Basic
JsDoc Toolkit runs via the Mozilla JavaScript Engine, named "Rhino." Rhino is implemented in Java, and is included along with the JsDoc Toolkit distribution, wrapped in a runner application called "jsrun." So all commands must start with this...

java -jar jsrun.jar ...
The path to the main JsDoc script, the path to your script and a template to use for output are all required, so a full example would be...

java -jar jsrun.jar app/run.js myscript.js -t=templates/jsdoc
Source Files
The arguments in the command line that refer to JavaScript source files you wish to process can be paths to single files, or paths to directories full of files.

java -jar jsrun.jar app/run.js one/file.js two/file.js -t=templates/jsdoc
java -jar jsrun.jar app/run.js myscripts/ -t=templates/jsdoc
You can combine directories and single files together...

java -jar jsrun.jar app/run.js myscripts/ one/file.js -t=templates/jsdoc
Recursing Source Directories
In the case where you are giving JsDoc Toolkit a path to a source directory, the default behavior is for that directory to be scanned for all files that end in the ".js" extension. By default, subdirectories are not scanned.

If you wish JsDoc Toolkit to descend into subdirectories, use the -r option. By default this will search for all source files to a depth of 10 subdirectories, but you can specify a different depth if you wish.

java -jar jsrun.jar app/run.js -r=4 myscripts/ -t=templates/jsdoc
Using a Template
To produce output files you must use a template to format the generated documentation. Use the -t option to specify which template you wish to use.

java -jar jsrun.jar app/run.js myscripts/ -t=templates/jsdoc
Note: You must specify a directory as the value to -t, not a file. That directory must contain a file named "publish.js".

Output Directories
If you are using an output template, by default the formatted output files will be created in a folder named "out". If you wish to change this behavior with the -d option.

java -jar jsrun.jar app/run.js -t=templates/jsdoc -d=my_docs myscripts/ -t=templates/jsdoc
Custom Source File Extensions
By default, the JsDoc Toolkit will only documentsource files that end in ".js" (case insensitive). If you prefer that it document files with a different filename extension, use the -x option. For example, to document files that end in ".sc" use this...

java -jar jsrun.jar app/run.js -x=sc myscripts/ -t=templates/jsdoc
You can specify multiple file extensions like so...

java -jar jsrun.jar app/run.js -x=sc,js,txt myscripts/ -t=templates/jsdoc
Note: Do not include a dot in the -x values, for example -x=.sc would not work. Note: The extensions are compared in a case insensitive manner, so the following are effectively the same to JsDoc Toolkit: -x=sc and -x=SC

Documenting All Functions
By default, only functions that you've written documentation comments for will appear in the output. If you want JsDoc Toolkit to generate documentation for all functions, even the uncommented ones, use the -a option.

java -jar jsrun.jar app/run.js -t=templates/jsdoc -a myscripts/

It is a convention that if you name a function with an underscore as the first character, you intend it to be private--for internal use only--not part of the public API. If you wish even the private symbols to be included in the output, use the -p option.

java -jar jsrun.jar app/run.js -t=templates/jsdoc -p /myscripts/
Using a Configuration File
If you find yourself entering the same command line switches over and over again, you can save these to a JSON file and include that file with the -c option.

java -jar jsrun.jar app/run.js -c=sample.conf myscripts/
Note: There really is a "sample.conf" file included in the standard JsDoc Toolkit distribution, which should help to get you started writing your own.