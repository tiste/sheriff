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
  puts "Label: #{@payload['action']}"

  label_name = (params[:name] || 'mergeable').to_s.downcase

  case request.env['HTTP_X_GITHUB_EVENT']
  when 'pull_request'
    if @payload['action'] === 'labeled'
      process_label(@payload['pull_request'], @payload['label'], label_name, true)
    end

    if @payload['action'] === 'unlabeled'
      process_label(@payload['pull_request'], @payload['label'], label_name, false)
    end

    if @payload['action'] === 'opened'
      process_label(@payload['pull_request'], {}, label_name, false)
    end
  end
end

post '/reviews' do
  @payload = JSON.parse(params[:payload])
  puts "Reviews: #{@payload['action']}"

  minimum = Integer(params[:minimum]) rescue 2

  case request.env['HTTP_X_GITHUB_EVENT']
  when 'pull_request'
    if @payload['action'] === 'opened'
      process_reviews(@payload['pull_request'], minimum)
    end
  when 'pull_request_review'
    if @payload['action'] === 'submitted'
      process_reviews(@payload['pull_request'], minimum)
    end
  end
end

helpers do
  def process_label(pull_request, label, name, is_success)
    do_something = label['name'].to_s.downcase === name || label.empty?

    if do_something
      state = is_success ? 'success' : 'error'
      description = is_success ? "The \"#{name}\" label is attached, go for it" : "Pull Request doesn\'t have the label \"#{name}\" yet"

      @client.create_status(pull_request['base']['repo']['full_name'], pull_request['head']['sha'], state, {
        context: 'sheriff/label',
        description: description,
      })
    end
  end

  def process_reviews(pull_request, minimum)
    reviews = @client.pull_request_reviews(pull_request['base']['repo']['full_name'], pull_request['number'])

    is_success = reviews.sort_by { |review| review[:id] }.reverse!.uniq { |review| review[:user][:id] }.select { |review| review[:state] === 'APPROVED' }.size >= minimum
    state = is_success ? 'success' : 'error'
    description = is_success ? "There is at least #{minimum} or more approvals, it's okay" : "Pull Request doesn't have enough reviews (#{minimum})"

    @client.create_status(pull_request['base']['repo']['full_name'], pull_request['head']['sha'], state, {
      context: 'sheriff/reviews',
      description: description,
    })
  end
end
