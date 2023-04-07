
/**
 * Object describing a question
 */
 class Question {
    /**
     * Create a new Question
     * @param {*} qid unique identifier for the question
     * @param {*} sid identifier of the survey in which the question is inserted
     * @param {*} title title of the question
     * @param {*} min {0,1} optional/mandatory question
     * @param {*} max >=1 single/multiple choice and -1 if the question type is "Open-ended"
     * @param {*} position indicates the position in the survey
     */
    constructor(qid, sid, title, min, max, position) {
      this.qid = qid;
      this.sid= sid;
      this.title = title;
      this.min=min;
      this.max=max;
      this.position=position;
    }
  
    /**
     * Creates a new Question from plain (JSON) objects
     * @param {*} json a plain object (coming form JSON deserialization)
     * with the right properties
     * @return {Question} the newly created object
     */
    static from(json) {
      const question = new Question(json.qid, json.sid, json.title, json.min, json.max, json.position);
      return question;
    }
  
  }
  
  export default Question;