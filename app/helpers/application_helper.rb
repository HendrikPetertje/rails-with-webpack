module ApplicationHelper
  def webpack_js_path
    @webpack_js_path ||= fetch_webpack_js_path
  end

  private

  def fetch_webpack_js_path
    if Rails.env.in?(%w[development test]) && dev_server_up?
      return "#{request.protocol + request.host}:3035/application.js"
    end

    appjs_path = WebpackApp::Application.config.webpack_parameters[:appjs_path]
    return appjs_path if appjs_path

    raise 'No dev server running and no appjs-build present'
  end

  def dev_server_up?
    HTTParty.get('http://localhost:3035/application.js')
    true
  rescue StandardError
    false
  end
end
