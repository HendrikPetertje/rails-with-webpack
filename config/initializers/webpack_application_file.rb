appjs_name = nil
if File.file?("#{Rails.root}/config/webpack/pointers/appjs.txt")
  appjs_name = File.read("#{Rails.root}/config/webpack/pointers/appjs.txt").gsub("\n", '').presence
end

webpack_parameters = {
  appjs_path: "/frontend/#{appjs_name}"
}

WebpackApp::Application.config.webpack_parameters = webpack_parameters
