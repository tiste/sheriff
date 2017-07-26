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
    process_label(@payload['pull_request'], label_name)
  end
end

post '/reviews' do
  @payload = JSON.parse(params[:payload])
  puts "Reviews: #{@payload['action']}"

  minimum = Integer(params[:minimum]) rescue 2

  case request.env['HTTP_X_GITHUB_EVENT']
  when 'pull_request'
    process_reviews(@payload['pull_request'], minimum)
  when 'pull_request_review'
    process_reviews(@payload['pull_request'], minimum)
  end
end

helpers do
  def process_label(pull_request, name)
    issue = @client.issue(pull_request['base']['repo']['full_name'], pull_request['number'])

    is_success = !issue.labels.select { |label| label[:name].downcase === name.downcase }.empty?
    state = is_success ? 'success' : 'error'
    description = is_success ? "The \"#{name}\" label is attached, go for it" : "Pull Request doesn\'t have the label \"#{name}\" yet"

    @client.create_status(pull_request['base']['repo']['full_name'], pull_request['head']['sha'], state, {
      context: 'sheriff/label',
      description: description,
    })
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
