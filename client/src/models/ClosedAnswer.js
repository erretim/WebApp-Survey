
/**
 * Object describing a proposed closed answer
 */
 class ClosedAnswer {
    /**
     * Create a new ClosedAnswer
     * @param {*} aid unique identifier for the proposed answer
     * @param {*} qid identifier of the question to which the proposed answer belongs
     * @param {*} title title of the proposed answer
     * @param {*} sid 
    

     */
    constructor(aid, qid, title, sid) {
      this.aid = aid;
      this.qid=qid;
      this.title = title;
      this.sid=sid;
    }
  
    /**
     * Creates a new proposed answer from plain (JSON) objects
     * @param {*} json a plain object (coming form JSON deserialization)
     * with the right properties
     * @return {ClosedAnswer} the newly created object
     */
    static from(json) {
      const closedAnswer = new ClosedAnswer(json.aid, json.qid, json.title, json.sid);
      return closedAnswer;
    }
  
  }
  
  export default ClosedAnswer;