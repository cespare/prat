# To run
#
# $ bundle install
# $ npm install
# $ bundle exec guard

require "rake"
load "./Rakefile"

guard :restarter, :command => "glp run prat.go" do
  watch(/\.*\.(go|tmpl)$/)
end

guard :shell, :all_on_start => true do
  watch %r{^coffee/.*\.coffee$} do |f|
    Rake::Task["build:coffee"].execute(f[0])
    nil
  end
  watch %r{^stylus/.*\.styl$} do |f|
    Rake::Task["build:stylus"].execute
    nil
  end
end
