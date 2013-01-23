require "coffee-script"
require "time"

include Rake::DSL

def spawn_and_raise(*args)
  _, status = Process.wait2(spawn(*args))
  unless status.exitstatus == 0
    raise "The command (#{args.map(&:inspect).join(" ")}) failed with status #{status.exitstatus}"
  end
end

desc "Gofmt all non-vendor source."
task :gofmt do
  (Dir["*.go"] + Dir["src/**/*.go"]).each do |f|
    spawn_and_raise("gofmt", "-l", "-w", f)
  end
end


task :build => ["build:server", "build:coffee", "build:stylus"]

namespace :build do
  desc "Compile the server."
  task :server do
    puts "Building server."
    spawn_and_raise(*%w{glp build -o prat})
  end

  desc "Compile the server for linux/amd64."
  task :server_linux do
    puts "Building server for linux/amd64."
    environment = { "CGO_ENABLED" => "0", "GOOS" => "linux", "GOARCH" => "amd64" }
    spawn_and_raise(environment, *%w{glp build -o prat})
  end

  desc "Build js dependencies."
  task :coffee, :file do |t, *args|
    puts "Building coffeescript."
    if args.empty?
      files = FileList["coffee/*.coffee"]
    else
      files = args
    end
    files.each do |file|
      output_name = File.join("public/compiled", File.basename(file).gsub(/\.coffee$/, ".js"))
      File.open(output_name, "w") { |f| f.write CoffeeScript.compile(File.read(file)) }
    end
  end

  desc "Build css dependencies."
  task :stylus do
    puts "Building stylus."
    # For now just hard-code the one file we compile. All other get pulled into a single generated CSS.
    # Note that you have to 'npm install' first.
    input_file = "style.styl"
    output_file = input_file.sub(/\.styl$/, ".css")
    spawn_and_raise(
      *%w{./node_modules/stylus/bin/stylus --include node_modules/nib/lib},
      :in => "stylus/#{input_file}",
      :out => "public/compiled/#{output_file}"
    )
  end
end
