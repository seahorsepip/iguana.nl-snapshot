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
gQuestionList.ScoreResults(0,"Dat leek helemaal nergens op!");
gQuestionList.ScoreResults(1,"Een advies: http://krokodillen.pagina.nl");
gQuestionList.ScoreResults(2,"Een advies: http://krokodillen.pagina.nl");
gQuestionList.ScoreResults(3,"Een advies: http://krokodillen.pagina.nl");
gQuestionList.ScoreResults(4,"Dit gaat al ergens op lijken.");
gQuestionList.ScoreResults(5,"Redelijke score!");
gQuestionList.ScoreResults(6,"Da's een mooie voldoende!");
gQuestionList.ScoreResults(7,"Dat is helemaal niet verkeerd, dacht ik zo!");
gQuestionList.ScoreResults(8,"Dat is bijna perfect!!");
gQuestionList.ScoreResults(9,"Je bent een echte krokodillendeskundige!!! Goed hoor.");
q = gQuestionList.NewQuestion("Hoeveel soorten krokodillen denk je dat er bekend zijn?");
q.NewAnswer("67",false);
q.NewAnswer("27",false);
q.NewAnswer("23",true);
q.NewAnswer("18",false);
q = gQuestionList.NewQuestion("Welke krokodillensoort wordt het grootst?");
q.NewAnswer("De Gaviaal (Gavialis gangeticus)",false);
q.NewAnswer("De Mississippi-alligator (Alligator mississippiensis)",false);
q.NewAnswer("De Brilkaaiman",false);
q.NewAnswer("De Zeekrokodil (Crocodylus porosus)",true);
q = gQuestionList.NewQuestion("In Florida zijn er in de laatste vijftig jaar van de vorige eeuw zo'n 250 aanvallen van Mississippi-alligators geregistreerd. Hoeveel hiervan waren met dodelijke afloop?");
q.NewAnswer("0",false);
q.NewAnswer("9",true);
q.NewAnswer("18",false);
q.NewAnswer("27",false);
q = gQuestionList.NewQuestion("Welke van de onderstaande beweringen is WAAR met betrekking tot het verschil tussen Alligators/Kaaimannen (Alligatoridae) en Echte Krokodillen (Crocodylidae)?");
q.NewAnswer("Bij de Alligators/Kaaimannen is de 4e onderkaakstand bij gesloten bek zichtbaar en bij de Echte Krokodillen niet.",false);
q.NewAnswer("Bij de Alligators/Kaaimannen zijn er verhoogde schubben op de staart aanwezig en bij de Echte Krokodillen niet.",false);
q.NewAnswer("Bij de Alligators/Kaaimannen is de 4e onderkaakstand bij gesloten bek niet zichtbaar en bij de Echte Krokodillen wel.",true);
q.NewAnswer("Bij de Alligators/Kaaimannen zijn er geen verhoogde schubben op de staart aanwezig en bij de Echte Krokodillen wel.",false);
q = gQuestionList.NewQuestion("Hoeveel tanden denk je dat een Gangesgaviaal (Gavialis gangeticus) heeft?");
q.NewAnswer("In de bovenkaak 48 en in de onderkaak 54.",false);
q.NewAnswer("In de bovenkaak 54 en in de onderkaak 48.",true);
q.NewAnswer("In de bovenkaak 68 en in de onderkaak 34.",false);
q.NewAnswer("In de bovenkaak 30 en in de onderkaak 30.",false);
q = gQuestionList.NewQuestion("Alle krokodillen hebben...");
q.NewAnswer("10 vingers en 10 tenen.",false);
q.NewAnswer("10 vingers en 8 tenen.",true);
q.NewAnswer("8 vingers en 8 tenen.",false);
q.NewAnswer("8 vingers en 10 tenen.",false);
q = gQuestionList.NewQuestion("Welke krokodillensoort is het meest gebonden aan water?");
q.NewAnswer("De Zeekrokodil (Crocodylus porosus).",false);
q.NewAnswer("De Gangesgaviaal (Gavialis gangeticus).",true);
q.NewAnswer("De Nijlkrokodil (Crocodylus niloticus).",false);
q.NewAnswer("Ze Zwarte Kaaiman (Melanosuchus niger).",false);
q = gQuestionList.NewQuestion("Kleine krokodillensoorten kunnen wel drie kwartier onder water blijven zonder adem te halen. Hoe lang houden de grote soorten het onder water uit zonder te ademen?");
q.NewAnswer("4 kwartier.",true);
q.NewAnswer("5 kwartier.",false);
q.NewAnswer("6 kwartier.",false);
q.NewAnswer("7 kwartier.",false);
q = gQuestionList.NewQuestion("Krokodillen leggen eieren. Hoe wordt het geslacht van de jongen die daar uit geboren worden bepaald?");
q.NewAnswer("Dit wordt via bepaalde hormonen bepaald.",false);
q.NewAnswer("Dit wordt genetisch bepaald.",false);
q.NewAnswer("Een hoge broedtemperatuur levert vnl. mannen op en een lage broedtemperatuur vnl. vrouwen.",true);
q.NewAnswer("Een hoge broedtemperatuur levert vnl. vrouwen op en een lage broedtemperatuur vnl. mannen.",false);
q = gQuestionList.NewQuestion("Hoe lang duurt het voor de eieren van de Nijlkrokodil (Crocodylus niloticus) uitkomen na het leggen?");
q.NewAnswer("11 tot 14 weken.",true);
q.NewAnswer("7 tot 9 weken.",false);
q.NewAnswer("16 tot 18 weken.",false);
q.NewAnswer("20 tot 22 weken.",false);



// <-- Quiz Source End 
