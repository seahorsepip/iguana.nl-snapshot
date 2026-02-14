//
// QueryString
//

function QueryString(key)
{
	var value = null;
	for (var i=0;i<QueryString.keys.length;i++)
	{
		if (QueryString.keys[i]==key)
		{
			value = QueryString.values[i];
			break;
		}
	}
	return value;
}
QueryString.keys = new Array();
QueryString.values = new Array();

function QueryString_Parse()
{
	var query = window.location.search.substring(1);
	var pairs = query.split("&");
	
	for (var i=0;i<pairs.length;i++)
	{
		var pos = pairs[i].indexOf('=');
		if (pos >= 0)
		{
			var argname = pairs[i].substring(0,pos);
			var value = pairs[i].substring(pos+1);
			QueryString.keys[QueryString.keys.length] = argname;
			QueryString.values[QueryString.values.length] = value;		
		}
	}

}

QueryString_Parse();


//
// Answer
//
function Answer_WriteHTML()
{
	document.write('<INPUT type="radio" value="' + this.id + '" name="answers"> ');
	document.write('<span  class="quizText">' + this.text + '</span><br>');
}

function Answer(aID)
{
	this.text = "New Answer";
	this.id = aID;
	this.correct = false;
	
	this.WriteHTML = Answer_WriteHTML;
}

//
// AnswerList
//

function AnswerList_NewAnswer()
{
	var a = new Answer(this.sequenceID);
	this.sequenceID++;
	this.aList[this.aList.length] = a;

	// Optional Args: text, correct
	if (arguments.length > 0)
		a.text = arguments[0];

	if (arguments.length > 1)
		a.correct = arguments[1];

	if (this.editor)
		this.editor.AnswerSectionUpdate();
		
	return a;
}

function AnswerList_Remove(id)
{
	for (var i=0;i<this.aList.length;i++)
	{
		if (this.aList[i] && this.aList[i].id == id)
		{
			this.aList[i] = null;
			break;
		}
	}
}

function AnswerList_Find(id)
{
	var result = null;
	for (var i=0;i<this.aList.length;i++)
	{
		if (this.aList[i] && this.aList[i].id == id)
		{
			result = this.aList[i];
			break;
		}
	}
	return result;
}

function AnswerList_WriteHTML()
{
	for (var i=0;i<this.aList.length;i++)
		this.aList[i].WriteHTML();
}

function AnswerList(editor)
{
	this.editor = editor;
	this.sequenceID = 0;
	this.aList = new Array();
	
	this.NewAnswer = AnswerList_NewAnswer;
	this.Remove = AnswerList_Remove;
	this.Find = AnswerList_Find;
	this.WriteHTML = AnswerList_WriteHTML;
}

//
// Question
//

function Question_NewAnswer(text,correct)
{
	this.answerList.NewAnswer(text,correct);
}

function Question_WriteHTML()
{
	document.write('<p class="quizQuestion">Q: ' + this.text + '</p>');
	this.answerList.WriteHTML();
}

function Question_GetCorrectAnswer(text,correct)
{
	var result = "";
	for (var i=0;i<this.answerList.aList.length;i++)
	{
		if (this.answerList.aList[i] && this.answerList.aList[i].correct)
		{
			result = this.answerList.aList[i].text;
			break;
		}
	}
	return result;
}

function Question(qID,editor)
{
	this.text = "New Question";
	this.id = qID;
	this.editor = editor;
		
	this.answerList = new AnswerList(editor);
	
	this.NewAnswer = Question_NewAnswer;
	this.WriteHTML = Question_WriteHTML;
	this.GetCorrectAnswer = Question_GetCorrectAnswer;
}

//
// QuestionList
//

function QuestionList_NewQuestion()
{
	var q = new Question(this.sequenceID,this.editor);
	this.sequenceID++;
	this.qList[this.qList.length] = q;
	
	// Optional Args: text
	if (arguments.length > 0)
		q.text = arguments[0];
	
	if (this.editor)
		this.editor.QuestionItemsAdd(q);
		
	return q;
}

function QuestionList_Remove(id)
{
	for (var i=0;i<this.qList.length;i++)
	{
		if (this.qList[i] && this.qList[i].id == id)
		{
			this.qList[i] = null;
			break;
		}
	}
}

function QuestionList_Find(id)
{
	var result = null;
	for (var i=0;i<this.qList.length;i++)
	{
		if (this.qList[i] && (this.qList[i].id == id))
		{
			result = this.qList[i];
			break;
		}
	}
	return result;
}

function QuestionList_WriteHTML()
{
	var index = 0;
	
	var lastQuestion = QueryString("lastQuestion");
	var ccount = QueryString("ccount");

	if (ccount == null)
		ccount = 0;
	else
		ccount = parseInt(ccount);

	document.write('<form name="quiz" method="GET" onsubmit="return QuestionListValidate(this)">');
		
	
	if (lastQuestion!=null)
	{
		lastQuestion = parseInt(lastQuestion);
		index = 1 + lastQuestion;
		var answerID = parseInt(QueryString("answers"));
		
		if (this.qList[lastQuestion].answerList.aList[answerID].correct)
		{
			document.write('<p class="quizRightWrong">Dat antwoord was... GOED!!</p>');
			ccount++;
		}
		else
		{
			var correctAnswer = this.qList[lastQuestion].GetCorrectAnswer();
			document.write('<p class="quizRightWrong">Dat antwoord was helemaal... FOUT!!</p>');
			document.write('<p class="quizText">Het goede antwoord op de vraag...</p>');
			document.write('<p class="quizIndent">' + this.qList[lastQuestion].text + '</p>');
			document.write('<p class="quizText">moet zijn:</p>');
			document.write('<p class="quizIndent">' + correctAnswer + '</p>');
		}
		
		
	}
	
	if (index < this.qList.length)
	{
		document.write('<input type="hidden" name="lastQuestion" value="' + index + '">')
		
		this.qList[index].WriteHTML();
		document.write('<p><input type="submit" name="submit" value="Volgende vraag >>"></p>')
	}
	else
	{
		var score = Math.round((ccount*100)/this.qList.length);
		var scoreResults = this.ScoreResults(Math.min(Math.floor(score/10),9));
		document.write('<p class="quizText">Je beantwoordde ' + ccount + ' vragen van de ' +
			this.qList.length + ' goed.</p>');
		document.write('<p class="quizText">Je score is ' + score + '%. ' + scoreResults + '</p>');
	}
	
	document.write('<input type="hidden" name="ccount" value="' + ccount + '">')
	document.write('</form>');
	
}

function QuestionList_ScoreResults(index,text)
{
	// Optional Args: text
	if (arguments.length > 1)
	{
		this.scoreResults[index] = text;
	}
		
	return this.scoreResults[index];
}

function QuestionList(editor)
{
	this.sequenceID = 0;
	this.qList = new Array();
	this.scoreResults = new Array(10);
	this.editor = editor;
	
	this.NewQuestion = QuestionList_NewQuestion;
	this.Remove = QuestionList_Remove;
	this.Find = QuestionList_Find;
	this.WriteHTML = QuestionList_WriteHTML;
	this.ScoreResults = QuestionList_ScoreResults;
}

function QuestionListValidate(theForm)
{
	var validated = false;
	
	for (var i=0;i<theForm.answers.length;i++)
	{
		if (theForm.answers[i].checked == true)
		{
			validated = true;
			break;
		}
	}
	
	if (!validated)
		alert("Kies een antwoord a.u.b..");
	
	return validated;
}

var gQuestionList = new QuestionList(null);

// Quiz Source Start (to edit with QuizEditor copy/paste between here and end
// -->
gQuestionList.ScoreResults(0,"Je hebt van amfibieën geen kaas gegeten!");
gQuestionList.ScoreResults(1,"Het lijkt nog nergens op!");
gQuestionList.ScoreResults(2,"Het lijkt nog nergens op!");
gQuestionList.ScoreResults(3,"Het lijkt nog nergens op!");
gQuestionList.ScoreResults(4,"Je kennis van amfibieën is onder de maat!");
gQuestionList.ScoreResults(5,"Het is niet perfect, maar het begint ergens op te lijken!");
gQuestionList.ScoreResults(6,"Da´s niet slecht!");
gQuestionList.ScoreResults(7,"Ruim voldoende!!");
gQuestionList.ScoreResults(8,"Bijna perfect!");
gQuestionList.ScoreResults(9,"Je bent \"King of the Frogs\"!");
q = gQuestionList.NewQuestion("Hoe ademen amfibieën?");
q.NewAnswer("Met hun longen.",false);
q.NewAnswer("Met hun huid en longen.",false);
q.NewAnswer("Met hun huid, kieuwen en longen.",true);
q.NewAnswer("Met hun kieuwen.",false);
q = gQuestionList.NewQuestion("Waaraan moet het leefgebied van de meeste salamanders in ieder geval voldoen?");
q.NewAnswer("Er moet een hoge temperatuur heersen.",false);
q.NewAnswer("Er moet veel rots en steen aanwezig zijn.",false);
q.NewAnswer("Het moet er enigszins vochtig zijn.",true);
q.NewAnswer("De temperatuur mag niet boven de 5°C. komen.",false);
q = gQuestionList.NewQuestion("Hoelang bewonen amfibieën de aarde al?");
q.NewAnswer("Ca. 3.500 jaar",false);
q.NewAnswer("Ca. 35.000 jaar",false);
q.NewAnswer("Ca. 350.000 jaar.",false);
q.NewAnswer("Ca. 350.000.000 jaar",true);
q = gQuestionList.NewQuestion("Het genus Eleutherodactylus, de fluitkikkers, kent de meeste soorten. Hoeveel denk je dat het er zijn?");
q.NewAnswer("Ca. 500 soorten.",true);
q.NewAnswer("Ca. 250 soorten.",false);
q.NewAnswer("Ca. 1500 soorten.",false);
q.NewAnswer("Ca. 35 soorten.",false);
q = gQuestionList.NewQuestion("De Mount Lyell Salamander (Hydromantes platycephalus) wordt meestal aangetroffen onder stenen op glooiende hellingen. Wanneer je zo´n steen oppakt proberen de salamanders op een bijzondere wijze te ontkomen aan het gevaar. Hoe denk je dat ze dit doen? ");
q.NewAnswer("Ze rollen zich op tot een bal en laten zich naar beneden rollen.",true);
q.NewAnswer("Ze nemen de kleur van de bodem aan waardoor ze niet meer opvallen.",false);
q.NewAnswer("Als de steen opgetild wordt beginnen ze een krijsend geluid te maken en rennen hard weg.",false);
q.NewAnswer("De salamanders draaien zich op hun rug, stuiptrekken een paar keer en houden zich dan dood.",false);
q = gQuestionList.NewQuestion("De Chinese Reuzensalamander (Andrias davidianus) wordt beschouwd als het grootste amfibie ter wereld. Hoe lang kunnen ze worden, denk je?");
q.NewAnswer("Ca. 100 cm.",false);
q.NewAnswer("Ca. 140 cm.",false);
q.NewAnswer("Ca. 180 cm.",true);
q.NewAnswer("Ca. 220 cm.",false);
q = gQuestionList.NewQuestion("Nederland wordt ook wel eens kikkerlandje genoemd. Hoeveel soorten amfibieën (kikkers, padden en salamanders) komen er in Nederland voor?");
q.NewAnswer("12 soorten.",false);
q.NewAnswer("14 soorten.",false);
q.NewAnswer("16 soorten.",true);
q.NewAnswer("18 soorten.",false);
q = gQuestionList.NewQuestion("Wormsalamanders...");
q.NewAnswer("Leven alleen op het land.",false);
q.NewAnswer("Leven alleen in het water.",false);
q.NewAnswer("Afhankelijk van de soort op het land of in het water.",true);
q.NewAnswer("Bestaan niet.",false);
q = gQuestionList.NewQuestion("Welke bewering is waar?");
q.NewAnswer("Kikkers hebben geen tanden.",false);
q.NewAnswer("Padden hebben geen tanden.",true);
q.NewAnswer("Salamanders hebben geen tanden.",false);
q.NewAnswer("Kikkers, padden en salamanders hebben geen tanden.",false);
q = gQuestionList.NewQuestion("Hoeveel soorten amfibieën denk je dat er bekend zijn?");
q.NewAnswer("Ca. 15.400 soorten.",false);
q.NewAnswer("Ca. 5.600 soorten.",true);
q.NewAnswer("Ca. 1.250 soorten.",false);
q.NewAnswer("Ca. 950 soorten.",false);


// <-- Quiz Source End 
