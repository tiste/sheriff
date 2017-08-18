class CreateUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :users do |t|
      t.string :token, index: { unique: true }
      t.string :access_token
    end
  end
end
