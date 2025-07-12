export default class RSUserRegistry {
  constructor() {
    this.users = {};
  }

  create_user(user_id, user) {
    this.users[user_id] = Object.assign(user || {}, {id: user_id});
  }

  remove_user(user_id) {
    delete this.users[user_id];
  }

  get_user(user_id) {
    return this.users[user_id];
  }

  set_user_property(user_id, key, value) {
    this.get_user(user_id)[key] = value;
    if(this.on_user_property_change) {
      this.on_user_property_change(user_id, key, value);
    }
  }
};
