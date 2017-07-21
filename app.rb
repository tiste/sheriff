require 'sinatra'
require 'json'
require 'octokit'

ACCESS_TOKEN = ENV['GITHUB_PERSONAL_TOKEN']

before do
  @client ||= Octokit::Client.new(access_token: ACCESS_TOKEN)
end

get '/' do
  'I\'m okay dude.'
end

post '/event_handler' do
  @payload = JSON.parse(params[:payload])

  case request.env['HTTP_X_GITHUB_EVENT']
  when 'pull_request'
    if @payload['action'] === 'labeled'
      process_pull_request(@payload['pull_request'], @payload['label'], true)
    end

    if @payload['action'] === 'unlabeled'
      process_pull_request(@payload['pull_request'], @payload['label'], false)
    end
  end
end

helpers do
  def process_pull_request(pull_request, label, is_valid)
    if label['name'] === 'Mergeable'
      state = is_valid ? 'success' : 'error'

      @client.create_status(pull_request['base']['repo']['full_name'], pull_request['head']['sha'], state)
    end
  end
end
