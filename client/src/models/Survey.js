
/**
 * Object describing a survey
 */
 class Survey {
    /**
     * Create a new Survey
     * @param {*} sid unique identifier for the survey
     * @param {*} adminId identifier of the administrator who created the survey
     * @param {*} title title of the survey
     * @param {*} nResponses number of response this survey received
     */
    constructor(sid,adminId, title, nResponses) {
      this.sid = sid;
      this.adminId= adminId;
      this.title = title;
      this.nResponses = nResponses
    }
  
    /**
     * Creates a new Survey from plain (JSON) objects
     * @param {*} json a plain object (coming form JSON deserialization)
     * with the right properties
     * @return {Survey} the newly created object
     */
    static from(json) {
      const survey = new Survey(json.sid, json.adminId, json.title, json.nResponses);
      return survey;
    }
  
  }
  
  export default Survey;