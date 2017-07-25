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

post '/label' do
  @payload = JSON.parse(params[:payload])
  puts "Action: #{@payload['action']}"

  label_name = (params[:name] || 'mergeable').to_s.downcase

  case request.env['HTTP_X_GITHUB_EVENT']
  when 'pull_request'
    if @payload['action'] === 'labeled'
      process_pull_request(@payload['pull_request'], @payload['label'], label_name, true)
    end

    if @payload['action'] === 'unlabeled'
      process_pull_request(@payload['pull_request'], @payload['label'], label_name, false)
    end

    if @payload['action'] === 'opened'
      process_pull_request(@payload['pull_request'], {}, label_name, false)
    end
  end
end

helpers do
  def process_pull_request(pull_request, label, name, is_success)
    do_something = label['name'].to_s.downcase === name || label.empty?

    if do_something
      state = is_success ? 'success' : 'error'
      description = is_success ? "The #{name} label is attached, go for it" : "Pull Request doesn\'t have the label #{name} yet"

      @client.create_status(pull_request['base']['repo']['full_name'], pull_request['head']['sha'], state, {
        context: 'sheriff/label',
        description: description,
      })
    end
  end
end
