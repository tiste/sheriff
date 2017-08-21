require 'sinatra'
require 'sinatra/activerecord'
require 'json'
require 'uri'
require 'octokit'
require 'securerandom'

require './features'

Dir["#{Dir.pwd}/models/*.rb"].each { |file| require file }

CLIENT_ID = ENV['GITHUB_APP_CLIENT_ID']
CLIENT_SECRET = ENV['GITHUB_APP_SECRET_ID']

use Rack::Session::Cookie, secret: rand.to_s

before do
  authenticated?
end

get '/' do
  authenticate_web!

  erb :home
end

post '/setup' do
  feature = FEATURES[params[:name].to_sym]

  options = { token: @user.token }.merge params[:options] || {}

  @client.create_hook(params[:repo], 'web', { url: "http://sheriff.tiste.io/#{feature[:name]}?#{URI.encode_www_form(options)}" }, { events: feature[:github_events], active: true })

  redirect '/'
end

get '/callback' do
  session_code = request.env['rack.request.query_hash']['code']
  result = Octokit.exchange_code_for_token session_code, CLIENT_ID, CLIENT_SECRET

  if @user
    @user.update access_token: result[:access_token]
  else
    client = Octokit::Client.new access_token: result[:access_token]
    @user = User.find_by user_id: client.user.id

    if @user
      # first check if user is not already registered
      @user.update access_token: result[:access_token]
    else
      # otherwise create it
      @user = User.create user_id: client.user.id, token: SecureRandom.uuid, access_token: result[:access_token]
    end
  end

  session[:token] = @user.token

  redirect '/'
end


# features

get %r{/(label|reviews|commit-msg)} do
  authenticate_web!

  repos = @client.repos
  feature = FEATURES[params[:captures].first.to_sym]

  erb :feature, { locals: { token: @user.token, feature: feature, repos: repos } }
end

post '/label' do
  @payload = JSON.parse(params[:payload])
  puts "Label: #{@payload['action']}"

  label_name = (params[:name] || FEATURES[:label][:options][:name]).to_s.downcase

  case request.env['HTTP_X_GITHUB_EVENT']
  when 'pull_request'
    process_label(@payload['pull_request'], label_name)
  end
end

post '/reviews' do
  @payload = JSON.parse(params[:payload])
  puts "Reviews: #{@payload['action']}"

  minimum = Integer(params[:minimum]) rescue FEATURES[:reviews][:options][:minimum]

  case request.env['HTTP_X_GITHUB_EVENT']
  when 'pull_request'
    process_reviews(@payload['pull_request'], minimum)
  when 'pull_request_review'
    process_reviews(@payload['pull_request'], minimum)
  end
end

post '/commit-msg' do
  @payload = JSON.parse(params[:payload])
  puts "Commit msg: #{@payload['action']}"

  case request.env['HTTP_X_GITHUB_EVENT']
  when 'pull_request'
    process_commit_msg(@payload['pull_request'])
  end
end

helpers do
  def authenticated?
    token = session[:token] || params[:token]
    @user = User.find_by token: token

    if @user
      @client = Octokit::Client.new access_token: @user.access_token
    end
  end

  def authenticate!
    client = Octokit::Client.new
    url = client.authorize_url CLIENT_ID, scope: 'repo,write:repo_hook'

    redirect url
  end

  def authenticate_web!
    if @user
      client = Octokit::Client.new client_id: CLIENT_ID, client_secret: CLIENT_SECRET

      begin
        client.check_application_authorization @user.access_token
      rescue => e
        session[:token] = nil
        return authenticate!
      end
    else
      return authenticate!
    end
  end

  def process_label(pull_request, name)
    issue = @client.issue(pull_request['base']['repo']['full_name'], pull_request['number'])

    is_success = !issue.labels.select { |l| l[:name].downcase === name.downcase }.empty?
    state = is_success ? 'success' : 'error'
    description = is_success ? "The \"#{name}\" label is attached, go for it" : "Pull Request doesn\'t have the label \"#{name}\" yet"

    @client.create_status(pull_request['base']['repo']['full_name'], pull_request['head']['sha'], state, {
      context: 'sheriff/label',
      description: description,
    })
  end

  def process_reviews(pull_request, minimum)
    reviews = @client.pull_request_reviews(pull_request['base']['repo']['full_name'], pull_request['number'])

    is_success = reviews.sort_by { |r| r[:id] }.reverse!.uniq { |r| r[:user][:id] }.select { |r| r[:state] === 'APPROVED' }.size >= minimum
    state = is_success ? 'success' : 'error'
    description = is_success ? "There is at least #{minimum} or more approvals, it's okay" : "Pull Request doesn't have enough reviews (#{minimum})"

    @client.create_status(pull_request['base']['repo']['full_name'], pull_request['head']['sha'], state, {
      context: 'sheriff/reviews',
      description: description,
    })
  end

  COMMIT_MSG_REGEX = /^((\w+)(?:\(([^\)\s]+)\))?: (.+))(?:\n|$)/
  def process_commit_msg(pull_request)
    commits = @client.pull_request_commits(pull_request['base']['repo']['full_name'], pull_request['number'])

    errors = commits.map { |c| c[:commit] }.map { |c| c[:message] }.map { |c| COMMIT_MSG_REGEX =~ c }.select(&:nil?).count
    is_success = errors === 0
    state = is_success ? 'success' : 'error'
    description = is_success ? "All commit messages are okay" : "Some commits (#{errors}) have invalid messages"

    @client.create_status(pull_request['base']['repo']['full_name'], pull_request['head']['sha'], state, {
      context: 'sheriff/commit-msg',
      description: description,
    })
  end
end
