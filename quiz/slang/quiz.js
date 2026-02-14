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
gQuestionList.ScoreResults(0,"Van slangen weet je echt niks!");
gQuestionList.ScoreResults(1,"Nauwelijks iets goed!");
gQuestionList.ScoreResults(2,"Weinig goede antwoorden!");
gQuestionList.ScoreResults(3,"Dit is niet zo goed!");
gQuestionList.ScoreResults(4,"Dat valt een beetje tegen!");
gQuestionList.ScoreResults(5,"Het kan er mee door!");
gQuestionList.ScoreResults(6,"Best redelijk goed!");
gQuestionList.ScoreResults(7,"Helemaal niet slecht!");
gQuestionList.ScoreResults(8,"Bijna helemaal goed!");
gQuestionList.ScoreResults(9,"Je bent een echte slangendeskundige. Gefeliciteerd.!!");
q = gQuestionList.NewQuestion("Hoeveel soorten slangen denk je dat er bekend zijn?");
q.NewAnswer("Tussen 7500 en 7600 soorten.",false);
q.NewAnswer("Tussen 900 en 1000 soorten.",false);
q.NewAnswer("Tussen 2900 en 3000 soorten.",true);
q.NewAnswer("Tussen 3700 en 3800 soorten.",false);
q = gQuestionList.NewQuestion("De huid van slangen is...");
q.NewAnswer("Bedekt met schubben en glibberig.",false);
q.NewAnswer("Glad en droog.",false);
q.NewAnswer("Bedekt met schubben en droog.",true);
q.NewAnswer("Glad en glibberig.",false);
q = gQuestionList.NewQuestion("Slangen zijn hoogst waarschijnlijk geëvolueerd uit...");
q.NewAnswer("Hagedissen zonder poten.",false);
q.NewAnswer("Hagedissen met 4 poten.",true);
q.NewAnswer("Een serpentosaurus-achtige.",false);
q.NewAnswer("Een pootloos zoogdier.",false);
q = gQuestionList.NewQuestion("In Nederland leven ... soorten slangen in het wild.");
q.NewAnswer("1",false);
q.NewAnswer("2",false);
q.NewAnswer("3",true);
q.NewAnswer("4",false);
q = gQuestionList.NewQuestion("De Zuidamerikaanse Boa constrictor is …");
q.NewAnswer("Niet giftig.",true);
q.NewAnswer("Licht giftig.",false);
q.NewAnswer("Matig giftig.",false);
q.NewAnswer("Zeer giftig.",false);
q = gQuestionList.NewQuestion("Wat is het maximale aantal wervels dat bij slangen kan voorkomen?");
q.NewAnswer("Ca. 34 wervels.",false);
q.NewAnswer("Ca. 128 wervels",false);
q.NewAnswer("Ca. 375 wervels",false);
q.NewAnswer("Ca. 435 wervels.",true);
q = gQuestionList.NewQuestion("Hoeveel procent van alle slangensoorten is giftig?");
q.NewAnswer("Ca. 19 %",true);
q.NewAnswer("Ca. 50 %",false);
q.NewAnswer("Ca. 42 %",false);
q.NewAnswer("Ca. 6 %",false);
q = gQuestionList.NewQuestion("Wat is waar? Slangen hebben…");
q.NewAnswer("…beweeglijke oogleden en geen oren.",false);
q.NewAnswer("…onbeweeglijke oogleden en geen oren.",true);
q.NewAnswer("…beweeglijke oogleden en een goed gehoor.",false);
q.NewAnswer("…onbeweeglijke oogleden en een goed gehoor.",false);
q = gQuestionList.NewQuestion("In de London Zoo leefde tot 1939 de langste gifslang ooit gemeten. Het betrof hier een Koningscobra (Ophiophagus hannah). Hoe lang was dit dier toen hij doodgemaakt werd omdat de oorlog uitbrak.");
q.NewAnswer("Ca. 470 cm.",false);
q.NewAnswer("Ca. 570 cm.",true);
q.NewAnswer("Ca. 520 cm.",false);
q.NewAnswer("Ca. 670 cm.",false);
q = gQuestionList.NewQuestion("Hoeveel rijen tanden hebben slangen in hun bek?");
q.NewAnswer("Twee. Eentje in de bovenkaak en eentje in de onderkaak.",false);
q.NewAnswer("Vier. Twee in de bovenkaak en twee in de onderkaak.",false);
q.NewAnswer("Zes. Vier in de bovenkaak en twee in de onderkaak.",true);
q.NewAnswer("Acht. Vier in de bovenkaak en vier in de onderkaak.",false);
q = gQuestionList.NewQuestion("Op het Mexicaanse eiland Santa Catalina leeft een unieke ratelslangensoort (Crotalus catalinensis). Wat maakt deze soort zo bijzonder?");
q.NewAnswer("Het is de enige ratelslangensoort die niet giftig is.",false);
q.NewAnswer("Het is de enige ratelslangensoort die helemaal zwart gekleurd is.",false);
q.NewAnswer("Het is de enige ratelslangensoort die geen ratel heeft.",true);
q.NewAnswer("Het is de enige ratelslangensoort die kan zwemmen.",false);
q = gQuestionList.NewQuestion("De vijf slangensoorten van het genus Chrysopelea hebben een bijzonder manier van voortbeweging ontwikkeld. Welke is dat?");
q.NewAnswer("Ze kruipen voornamelijk achteruit.",false);
q.NewAnswer("Ze maken van hun lichaam een soort wokkel en \"draaien\" zichzelf vooruit.",false);
q.NewAnswer("Ze \"zweven\" van boom naar boom.",true);
q.NewAnswer("Ze leven onder de grond kruipen allen door onderaardse gangen die door andere dieren gemaakt zijn.",false);
q = gQuestionList.NewQuestion("Van een bepaalde Koningspython (Python regius) is bekend dat deze lang zonder voedsel kon zonder er ziek van te worden of er dood aan te gaan. Ook andere slangensoorten kunnen soms lang vasten. Hoe lang kon deze Koningspython zonder voedsel, denk je?");
q.NewAnswer("3 weken.",false);
q.NewAnswer("6 maanden.",false);
q.NewAnswer("11 maanden.",false);
q.NewAnswer("24 maanden.",true);
q = gQuestionList.NewQuestion("Wat is waar? Slangen...");
q.NewAnswer("Kunnen hun prooi hypnotiseren door hem aan te kijken.",false);
q.NewAnswer("Hebben een starende blik omdat ze geen beweeglijke oogleden hebben.",true);
q.NewAnswer("Slapen met een oog open en een oog dicht.",false);
q.NewAnswer("Hebben wel ogen, maar zien niks.",false);
q = gQuestionList.NewQuestion("Wat doet de, o.a. in Nederland voorkomende Ringslang (Natrix natrix) als hij lastig gevallen wordt en niet meer kan vluchten?");
q.NewAnswer("Gaat op zijn rug liggen en doet of hij dood is.",true);
q.NewAnswer("Bijt in zijn eigen staart en kruipt constant in de rondte.",false);
q.NewAnswer("Laat spontaan zijn staart afvallen en gaat er in de verwarring alsnog vandoor.",false);
q.NewAnswer("Graaft zich razendsnel in.",false);
q = gQuestionList.NewQuestion("Hoe lang wordt de aarde al bewoond door slangen?");
q.NewAnswer("Ca. 100.000 jaar.",false);
q.NewAnswer("Ca. 100.000.000 jaar.",true);
q.NewAnswer("Ca. 1.000.000.000 jaar.",false);
q.NewAnswer("Ca. 10.000.000.000 jaar.",false);
q = gQuestionList.NewQuestion("In 1960 werd een vrouwelijke Anaconda (Eunectes murinus) in Brazilië geschoten. Dit dier wordt beschouwd als het zwaarste exemplaar dat bekend is. Ze was 845 cm lang en 111 cm in doorsnee op het dikste punt. Hoe zwaar denk je dat ze was?");
q.NewAnswer("Ca. 125 kilo.",false);
q.NewAnswer("Ca. 225 kilo.",true);
q.NewAnswer("Ca. 325 kilo.",false);
q.NewAnswer("Ca. 425 kilo.",false);
q = gQuestionList.NewQuestion("De Namaqua Dwergpofadder (Bitis schneideri) wordt beschouwd als de kleinste gifslang. Wat is de maximumlengte van deze soort, denk je?");
q.NewAnswer("Ca. 20 cm.",true);
q.NewAnswer("Ca. 9 cm.",false);
q.NewAnswer("Ca. 32 cm.",false);
q.NewAnswer("Ca. 45 cm.",false);
q = gQuestionList.NewQuestion("In welk werelddeel komen meer giftige dan niet-giftige slangensoorten voor?");
q.NewAnswer("Azië.",false);
q.NewAnswer("Afrika.",false);
q.NewAnswer("Australië.",true);
q.NewAnswer("Europa.",false);
q = gQuestionList.NewQuestion("In welk van deze vier Europese landen komen geen slangen voor?");
q.NewAnswer("Luxemburg.",false);
q.NewAnswer("Ierland.",true);
q.NewAnswer("Polen.",false);
q.NewAnswer("Zweden.",false);



// <-- Quiz Source End 
