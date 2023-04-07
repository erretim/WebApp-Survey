
  
/**
 * Information about an administrator being passed
 */
 class Admin {
    /**
     * Constructs a new Administrator object
     * @param {Number} id unique identifier for the administrator being passed
     * @param {String} username 
    
     */
    constructor(id, username) {
      this.id = id;
      this.username=username;
    }
  
    /**
     * Construct an Administrator from a plain object
     * @param {{}} json 
     * @return {Admin} the newly created Admin object
     */
    static from(json) {
      return new Admin(json.id, json.username);
    }
  }
  
  export default Admin;