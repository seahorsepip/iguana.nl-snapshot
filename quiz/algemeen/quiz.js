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
gQuestionList.ScoreResults(0,"Je kennis van reptielen en amfibieën is ver ondermaats!");
gQuestionList.ScoreResults(1,"Je kennis van reptielen en amfibieën is ondermaats!");
gQuestionList.ScoreResults(2,"Je kennis van reptielen en amfibieën is ondermaats!");
gQuestionList.ScoreResults(3,"Je weet niet zo veel van deze dieren, hè?");
gQuestionList.ScoreResults(4,"Dit is niet goed en niet slecht, nietwaar?");
gQuestionList.ScoreResults(5,"In de bibliotheek kun je vast nog wat wijzer worden over dit soort dieren.");
gQuestionList.ScoreResults(6,"Da's een voldoende!");
gQuestionList.ScoreResults(7,"Da's een ruime voldoende!");
gQuestionList.ScoreResults(8,"Prima resultaat!");
gQuestionList.ScoreResults(9,"Je bent een echte kenner! Gefeliciteerd!!!!");
q = gQuestionList.NewQuestion("Wat is één van de typische verschillen tussen slangen en hagedissen?");
q.NewAnswer("Slangen zijn giftig en hagedissen niet.",false);
q.NewAnswer("Slangen hebben geen poten en hagedissen wel.",false);
q.NewAnswer("Slangen hebben geen bewegende oogleden en hagedissen meestal wel.",true);
q.NewAnswer("Slangen hebben geen staart en hagedissen wel.",false);
q = gQuestionList.NewQuestion("Een axolotl is een...");
q.NewAnswer("Mythisch wezen.",false);
q.NewAnswer("Mexicaanse salamandersoort.",true);
q.NewAnswer("Zuid-Amerikaanse leguanensoort.",false);
q.NewAnswer("Australische paddensoort.",false);
q = gQuestionList.NewQuestion("Met een topsnelheid van zo'n 35 kilometer per uur wordt dit dier gezien als het snelste reptiel.");
q.NewAnswer("Soepschildpad (Chelonia mydas).",true);
q.NewAnswer("Surinaamse renhagedis (Ameiva ameiva).",false);
q.NewAnswer("Neushoornadder (Bitis nasicornis).",false);
q.NewAnswer("Zwarte kaaiman (Melanosuchus niger).",false);
q = gQuestionList.NewQuestion("Een tuatara is een...");
q.NewAnswer("Australische boomsalamander.",false);
q.NewAnswer("Een Afrikaanse graafkikker.",false);
q.NewAnswer("Een Aziatische tunnelhagedis.",false);
q.NewAnswer("Een Nieuw-Zeelandse brughagedis.",true);
q = gQuestionList.NewQuestion("De British Virgin Islands-gecko (Spherodactylus pathenopian) wordt beschouwd als de kleinste reptielensoort. Wat is de maximumlengte van dit diertje?");
q.NewAnswer("7 mm.",false);
q.NewAnswer("18 mm.",true);
q.NewAnswer("50 mm.",false);
q.NewAnswer("87 mm.",false);
q = gQuestionList.NewQuestion("Amfibieën doorlopen tijdens hun ontwikkeling van ei naar volwassen dier een aantal stadia. Dit wordt metamorfose genoemd. Welke lichaamsstof zorgt hiervoor?");
q.NewAnswer("Metamorphosaal hormoon.",false);
q.NewAnswer("Groeihormoon.",false);
q.NewAnswer("Schildklierhormoon.",true);
q.NewAnswer("Guanine hormoon.",false);
q = gQuestionList.NewQuestion("Wat is een olm?");
q.NewAnswer("Een permanent op het land levende kikkersoort.",false);
q.NewAnswer("Een permanent op het land levende salamandersoort.",false);
q.NewAnswer("Een permanent in het water levende kikkersoort.",false);
q.NewAnswer("Een permanent in het water levende salamandersoort.",true);
q = gQuestionList.NewQuestion("Wat is één van de typische verschillen tussen salamanders en hagedissen?");
q.NewAnswer("Hagedissen vervellen als ze groeien en salamanders niet.",false);
q.NewAnswer("Hagedissen leggen eieren en salamanders niet.",false);
q.NewAnswer("Hagedissen ademen alleen met hun longen en salamanders ook door hun huid.",true);
q.NewAnswer("Hagedissen zijn ectotherm (hun lichaamstemperatuur is afhankelijk van de omgevingstemperatuur) en salamanders niet.",false);
q = gQuestionList.NewQuestion("In welke periode verschenen de reptielen op de aarde?");
q.NewAnswer("Het Krijt (ca. 70.000.000 jaar geleden).",false);
q.NewAnswer("Het Jura (ca. 180.000.000 miljoen jaar geleden).",false);
q.NewAnswer("Het Boven-Carboon (ca. 260.000.000 jaar geleden).",true);
q.NewAnswer("Het Devoon (ca. 350.000.000 jaar geleden).",false);
q = gQuestionList.NewQuestion("In Nederland leven vier soorten hagedissen in het wild. Welke van de volgende vier hoort niet in dit rijtje thuis?");
q.NewAnswer("Hazelworm (Anguis fragilis).",false);
q.NewAnswer("Muurhagedis (Podarcis muralis).",false);
q.NewAnswer("Levendbarende hagedis (Lacerta vivipara).",false);
q.NewAnswer("Weidehagedis (Lacerta praticola).",true);



// <-- Quiz Source End 
