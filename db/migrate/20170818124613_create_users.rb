class CreateUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :users do |t|
      t.string :access_token
      t.string :token, index: { unique: true }
      t.string :user_id, index: { unique: true }
    end
  end
end
