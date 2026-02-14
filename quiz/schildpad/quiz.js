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
gQuestionList.ScoreResults(0,"Mischien ben je wel slim, maar van schildpadden weet je niet veel!");
gQuestionList.ScoreResults(1,"Mischien ben je wel slim, maar van schildpadden weet je niet veel!");
gQuestionList.ScoreResults(2,"Mischien ben je wel slim, maar van schildpadden weet je niet veel!");
gQuestionList.ScoreResults(3,"Je kennis van schildpadden is beperkt!");
gQuestionList.ScoreResults(4,"Het valt me niet tegen, maar goed is het niet!");
gQuestionList.ScoreResults(5,"Dit gaat er op lijken, vind je niet?");
gQuestionList.ScoreResults(6,"Da's in ieder geval een voldoende!");
gQuestionList.ScoreResults(7,"Helemaal niet slecht hoor!");
gQuestionList.ScoreResults(8,"Hartstikke goed... je weet er veel van!");
gQuestionList.ScoreResults(9,"Beter dan dit kan haast niet. Prima resultaat!!!");
q = gQuestionList.NewQuestion("Hoeveel soorten schildpadden denk je dat er bekend zijn?");
q.NewAnswer("Ca. 200 soorten.",false);
q.NewAnswer("Ca. 250 soorten.",false);
q.NewAnswer("Ca. 300 soorten.",true);
q.NewAnswer("Ca. 350 soorten.",false);
q = gQuestionList.NewQuestion("Hoe oud is de, voor zover bekend, de oudste, nu nog in leven zijnde schildpad?");
q.NewAnswer("Ca. 100 jaar.",false);
q.NewAnswer("Ca. 120 jaar.",false);
q.NewAnswer("Ca. 170 jaar.",true);
q.NewAnswer("Ca. 200 jaar.",false);
q = gQuestionList.NewQuestion("Van de Galapagosreuzenschildpaddensoort -Geochelone nigra abingdonii - leeft er nog maar één exemplaar. Hoe heet dit dier?");
q.NewAnswer("Jolly Jamira.",false);
q.NewAnswer("Lonesome George.",true);
q.NewAnswer("Poor Johnny.",false);
q.NewAnswer("Lonely Maria.",false);
q = gQuestionList.NewQuestion("De 70 tot 80 kilo zwaar wordende Alligatorschildpad (Macrochelys temminckii) eet o.a. kikkers, slakken, wormen, schaaldieren, kreeften, waterplanten en andere schildpadden. Maar zijn belangrijkste voedsel bestaat uit vissen. Hoe vangt hij die?");
q.NewAnswer("Hij zwemt constant met zijn bek open tot er een vis in komt en klapt dan zijn bek dicht.",false);
q.NewAnswer("Hij ligt op de bodem met zijn bek open om vissen naar binnen te lokken met een wormachtig uitsteekseltje achter in zijn bek.",true);
q.NewAnswer("Hij kronkelt met zijn staart alsof het een worm is en lokt zo de vissen naar zich toe.",false);
q.NewAnswer("Hij heeft een tong als een kameleon en vangt daarmee de vissen.",false);
q = gQuestionList.NewQuestion("De zwaarste schildpaddensoort is de Pacifische Lederschildpad (Dermochelys coriacea schlegeli), één van de acht zeeschildpaddensoorten. Hoe zwaar denk je dat deze soort kan worden?");
q.NewAnswer("Ca. 865 kilo.",true);
q.NewAnswer("Ca. 455 kilo.",false);
q.NewAnswer("Ca. 1500 kilo.",false);
q.NewAnswer("Ca. 245 kilo.",false);
q = gQuestionList.NewQuestion("Welke schildpaddensoort werd vroeger soms gebruikt om mensen die verdronken waren op te sporen?");
q.NewAnswer("De Ambonese Doosschildpad (Cuora amboinensis).",false);
q.NewAnswer("De Bijtschildpad (Chelydra serpentina).",true);
q.NewAnswer("De Sporenschildpad (Geochelone sulcata).",false);
q.NewAnswer("De Soepschildpad (Chelonia mydas).",false);
q = gQuestionList.NewQuestion("Schildpadden hebben...");
q.NewAnswer("Scherpe hoornrichels op zowel boven- als onderkaakbeen.",true);
q.NewAnswer("Alleen een scherpe hoornrichel op  het onderkaakbeen.",false);
q.NewAnswer("Alleen een scherpe hoornrichel op  het bovenkaakbeen.",false);
q.NewAnswer("Tanden op beide kaakbeenderen.",false);
q = gQuestionList.NewQuestion("De -Orde Der Schildpadden- (Testudines) bestaat uit...");
q.NewAnswer("Twee suborden: Halswenders (Pleurodira) en Halsrekkers (Scriptodira).",false);
q.NewAnswer("Twee suborden: Halswenders (Pleurodira) en Halsbergers (Cryptodira).",true);
q.NewAnswer("Twee suborden: Halsbergers (Cryptodira) en Halsrekkers (Scriptodira).",false);
q.NewAnswer("Drie suborden: Halswenders (Pleurodira),  Halsrekkers (Scriptodira) en Halsbergers (Cryptodira)..",false);
q = gQuestionList.NewQuestion("Hoe komt het dat verkouden waterschildpadden scheef in het water zwemmen?");
q.NewAnswer("Door het niezen gaan ze steeds scheef.",false);
q.NewAnswer("Door de koorts kunnen ze hun evenwicht niet goed reguleren.",false);
q.NewAnswer("Doordat ze maar één van de voorste zwemflippers kunen gebruiken wanneer ze het snot van hun neus moeten vegen om goed te kunnen ademen.",false);
q.NewAnswer("Als de longen niet goed werken kan de lucht niet van de ene long naar de andere stromen om in evenwicht te blijven.",true);
q = gQuestionList.NewQuestion("Wat is waar? Schildpadden hebben...");
q.NewAnswer("Een goed gezichtsvermogen, een goed gehoor en een goed geurvermogen.",false);
q.NewAnswer("Een goed gezichtsvermogen, een slecht gehoor en een goed geurvermogen.",true);
q.NewAnswer("Een slecht gezichtsvermogen, een goed gehoor en een goed geurvermogen.",false);
q.NewAnswer("Een slecht gezichtsvermogen, een goed gehoor en een slecht geurvermogen.",false);
q = gQuestionList.NewQuestion("De in het Boven-Krijt levende, Noord-amerikaanse Reuzenschildpad (Archelon ischyros) is inmiddels uitgestorven. Hoe lang denk je dat het schild van deze soort werd?");
q.NewAnswer("Ca. 4 meter.",false);
q.NewAnswer("Ca. 5 meter.",false);
q.NewAnswer("Ca. 6 meter.",false);
q.NewAnswer("Ca. 7 meter.",false);
q = gQuestionList.NewQuestion("De Galapagosreuzenschildpad (Geochelone nigra) en de Seychellenreuzenschildpad (Dipsochelys dussumieri) (was Geochelone gigantea) verschillen o.a. doordat laatstgenoemde soort een groter pantsermaximum heeft dan eesrtgenoemde soort. Op welke opvallende manier verschillen deze soorten, beide in Reptielenzoo Iguana te bewonderen, nog meer?");
q.NewAnswer("De Galapagosreuzenschildpad heeft geen staart en de Seychellenreuzenschildpad wel.",false);
q.NewAnswer("Bij de Galapagosreuzenschildpad ontbreekt het enkelvoudige nekschild aan de voorrand van het rugpantser en is wel aanwezig bij de Seychellenreuzenschildpad.",true);
q.NewAnswer("De Galapagosreuzenschildpad heeft een staart en de Seychellenreuzenschildpad niet.",false);
q.NewAnswer("Bij de Seychellenreuzenschildpad ontbreekt het enkelvoudige nekschild aan de voorrand van het rugpantser en is wel aanwezig bij de Galapagosreuzenschildpad.",false);
q = gQuestionList.NewQuestion("In een Griekse sage wordt verhaald dat Apollo iets van het rugschild van een zeeschildpad maakt. Wat maakte hij?");
q.NewAnswer("Hij spande snaren op het schild en vond op deze manier de lier uit.",true);
q.NewAnswer("Hij droeg een schild op zijn borst en een op zijn rug en vond zo het harnas uit.",false);
q.NewAnswer("Hij liet zijn vrouwen de was doen in een schild en vond zo de wastobbe uit.",false);
q.NewAnswer("Hij legde zijn pasgeboren zoon in een schild en bewoog hem zachtjes heen en weer tot zijn zoon sliep en vond zo de wieg uit.",false);
q = gQuestionList.NewQuestion("De Sierschildpad (Chrysemys picta) is soms, na beëindiging van de winterslaap, al aktief bij een watertemperatuur van...");
q.NewAnswer("8 graden Celsius.",true);
q.NewAnswer("12 graden Celsius.",false);
q.NewAnswer("16 graden Celsius.",false);
q.NewAnswer("20 graden Celsius.",false);
q = gQuestionList.NewQuestion("De wervelkolom van een schildpad bestaat uit...");
q.NewAnswer("12 halswervels, 8 rompwervels en 3-12 staartwervels.",false);
q.NewAnswer("10 halswervels, 8 rompwervels en 38-66 staartwervels.",false);
q.NewAnswer("8 halswervels, 10 rompwervels en 18-33 staartwervels.",true);
q.NewAnswer("18 halswervels, 10 rompwervels en 4-42 staartwervels.",false);
q = gQuestionList.NewQuestion("Het pantser van een schildpad is...");
q.NewAnswer("Geheel gevoelloos omdat het schild te vergelijken is met onze nagels.",false);
q.NewAnswer("Zeer gevoelig door de aanwezigheid van een huidlaag, voorzien van bloedvaten en zenuwen, tussen de beenplaten en de hoornschilden.",true);
q.NewAnswer("Nauwelijks gevoelig, zelfs niet als er geweld op wordt uitgeoefend.",false);
q.NewAnswer("Geheel gevoelloos omdat het gehele schild uit dood materiaal bestaat.",false);
q = gQuestionList.NewQuestion("Van welke schildpaddensoort is het bekend dat hij in bomen kan klimmen?");
q.NewAnswer("De Stekelrandklepschildpad (Kinixys erosa).",false);
q.NewAnswer("De Grootkopschildpad (Platysternon megacephalum).",true);
q.NewAnswer("De Sterschildpad (Geochelone elegans).",false);
q.NewAnswer("De Stekelranddrieklauwschildpad (Trionys spiniferus).",false);
q = gQuestionList.NewQuestion("Welke bewering over de Roodwangsierschildpad (Trachemys scripta elegans) is waar?");
q.NewAnswer("Onder extreme omstandigheden is deze schildpad eierlevendbarend.",false);
q.NewAnswer("De eieren die deze schildpadden in het najaar leggen houden soms een winterslaap en komen dan pas in het volgende voorjaar uit.",true);
q.NewAnswer("In sommige gebieden plant deze soort zich ongeslachtelijk voort.",false);
q.NewAnswer("In sommige gebieden is deze soort al geslachtsrijp op een leeftijd van vijf maanden.",false);
q = gQuestionList.NewQuestion("Op welke manier vangt de Matamata (Chelus fimbriatus) zijn prooi?");
q.NewAnswer("Jaagt aktief op vissen door ze te achtervolgen.",false);
q.NewAnswer("Eet alleen dode vissen.",false);
q.NewAnswer("Is een vegetarische schildpad.",false);
q.NewAnswer("Zuigt de vissen zijn grote bek in door deze plotseling te openen als er een langs zwemt.",true);
q = gQuestionList.NewQuestion("Welke schildpad wordt beschouwd als de kleinste soort?");
q.NewAnswer("De Phillipijnse Woudschildpad (Heosemys leijtensis).",false);
q.NewAnswer("De Egyptische landschildpad (Testudo kleinmanni).",false);
q.NewAnswer("De Gespikkelde Padloper (Homopus signatus cafer).",true);
q.NewAnswer("De Mississippizaagrugschildpad (Graptemys kohnii).",false);



// <-- Quiz Source End 
