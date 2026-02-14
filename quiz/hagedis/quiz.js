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
gQuestionList.ScoreResults(0,"Dat leek echt helemaal nergens op!!!");
gQuestionList.ScoreResults(1,"Dat leek echt helemaal nergens op!!!");
gQuestionList.ScoreResults(2,"Je zal nog heel veel moeten lezen en leren op hagedissengebied!!");
gQuestionList.ScoreResults(3,"Je zal nog heel veel moeten lezen en leren op hagedissengebied!!");
gQuestionList.ScoreResults(4,"Nou, dat valt me niet tegen... maar goed is het nog niet!");
gQuestionList.ScoreResults(5,"Ongeveer de helft goed. Kan beter, maar kan ook slechter.");
gQuestionList.ScoreResults(6,"Niet eens zo'n slechte uitkomst, vind je niet?");
gQuestionList.ScoreResults(7,"Dat is wat je noemt... een ruime voldoende!");
gQuestionList.ScoreResults(8,"Bijna alles goed. Je lijkt wel een hagedisoloog.");
gQuestionList.ScoreResults(9,"Kijk, dat is het betere werk! Prima gedaan hoor. Mijn complimenten!!!");
q = gQuestionList.NewQuestion("Hoeveel soorten hagedissen denk je dat er bekend zijn?");
q.NewAnswer("Tussen 4600 en 4700 soorten.",true);
q.NewAnswer("Tussen 3600 en 3700 soorten.",false);
q.NewAnswer("Tussen 1100 en 1200 soorten.",false);
q.NewAnswer("Tussen 2800 en 2900 soorten.",false);
q = gQuestionList.NewQuestion("Welke hagedissen kunnen hun ogen onafhankelijk van elkaar bewegen?");
q.NewAnswer("Varanen.",false);
q.NewAnswer("Gekko's.",false);
q.NewAnswer("Kameleons.",true);
q.NewAnswer("Agamen.",false);
q = gQuestionList.NewQuestion("Welke hagedissenfamilie is de grootste met ruim 1280 soorten?");
q.NewAnswer("Gekkonidae.",false);
q.NewAnswer("Agamidae.",false);
q.NewAnswer("Scincidae.",true);
q.NewAnswer("Chamaeleonidae.",false);
q = gQuestionList.NewQuestion("De Noord- en Midden-Amerikaanse Padhagedissen (Phrynosoma species) zijn bijzondere dieren. Naast hun voedselspecialisatie (mieren) hebben ze nog een kenmerkende eigenschap. Welke is dit?");
q.NewAnswer("Ze krullen hun staart tot een cirkel als ze zich bedreigd voelen.",false);
q.NewAnswer("Ze spuiten straaltjes bloed uit hun ogen als ze zich bedreigd voelen.",true);
q.NewAnswer("Ze kwaken als padden als ze zich bedreigd voelen.",false);
q.NewAnswer("Ze gaan op hun rug liggen als ze zich bedreigd voelen.",false);
q = gQuestionList.NewQuestion("Hoeveel hagedissensoorten zijn giftig?");
q.NewAnswer("0",false);
q.NewAnswer("1",false);
q.NewAnswer("2",true);
q.NewAnswer("3",false);
q = gQuestionList.NewQuestion("Veel soorten gekko's kunnen langs het plafond of zelfs op vertikale ruiten lopen. Hoe kan dit?");
q.NewAnswer("Op de onderkant van hun pootjes zitten een soort zuignapjes.",false);
q.NewAnswer("Op de onderkant van hun pootjes zitten talloze cellen met 'n soort haakjes waarmee ze aan elke oneffenheid kunnen blijven hangen.",true);
q.NewAnswer("Op de onderkant van hun pootjes zit een soort lijmachtige substantie.",false);
q.NewAnswer("Ze klemmen zich vast met hun vlijmscherpe nagels.",false);
q = gQuestionList.NewQuestion("De muurgekko (Tarentola mauritanica) heeft een bijzondere manier ontwikkeld om zijn leven te redden wanneer hij aangevallen wordt door een predator. Welke...?");
q.NewAnswer("De gekko laat plotseling een stuk van de staart afbreken. Dit stuk staart blijft nog een paar minuten kronkelen en trekt de aandacht van de predator waardoor de hagedis kan ontsnappen.",true);
q.NewAnswer("De gekko draait zich op zijn rug en doet alsof hij dood is. Zo verliest de predator zijn interesse en de gekko kan ontkomen.",false);
q.NewAnswer("De gekko maakt razendsnel een paar sprongen van bijna 1 meter hoog waardoor de predator schrikt en de gekko kan ontkomen.",false);
q.NewAnswer("De gekko spuwt een stinkende vloeistof op de bek van de predator waardoor die schrikt en de gekko kan ontkomen.",false);
q = gQuestionList.NewQuestion("De Seychellendaggekko (Phelsuma abotti) heeft een relatie met een ander dier in zijn leefgebied ontwikkeld. Met welk dier is dat?");
q.NewAnswer("Met de Seychellenringslang (Natrix seychellensis). Hij houdt zich meestal in de buurt van deze kikkeretende slang op en is daardoor veilig voor andere dieren.",false);
q.NewAnswer("Met de Seychellenreuzenschildpad (Dipsochelys dussumieri). Hij wordt vaak gevonden op de rand van het rugschild om daar insekten te vangen die aangetrokken worden door de schildpaddenontlasting.",true);
q.NewAnswer("Met de Seychellenvalk (Falco ararea). De hagedissen verblijven het grootste deel van hun leven in en bij het nest van deze valken en worden daardoor niet lastig gevallen door andere predatoren.",false);
q.NewAnswer("Met de Seychellengems (Gemsus seychellensis) De hagedissen zitten overdag op de ruggen van deze gemzen waar ze zich in de vacht kunnen verbergen en insekten kunnen vangen die door de gemzen worden aangetrokken.",false);
q = gQuestionList.NewQuestion("De meeste daggekko's van het genus Phelsuma leven op...");
q.NewAnswer("Bali, Java en Maliesië.",false);
q.NewAnswer("Nieuw-Zeeland.",false);
q.NewAnswer("Madagascar en de omliggende eilanden.",true);
q.NewAnswer("Kreta, Rhodos, Lesbos en Korfu.",false);
q = gQuestionList.NewQuestion("Wat is het meest kenmerkende en betrouwbare verschil tussen Agamen en Leguanen?");
q.NewAnswer("Bij Agamen bevinden de tanden zich bovenop de kaakbeenderen en bij Leguanen aan de binnenkant hiervan.",true);
q.NewAnswer("Bij Leguanen bevinden de tanden zich bovenop de kaakbeenderen en bij Agamen aan de binnenkant hiervan.",false);
q.NewAnswer("Agamen kunnen spontaan hun staart loslaten als ze aangevallen worden en Leguanen niet.",false);
q.NewAnswer("Leguanen kunnen spontaan hun staart loslaten als ze aangevallen worden en lAgamen niet.",false);
q = gQuestionList.NewQuestion("De Zeeleguaan (Amblyrhynchus cristatus) voedt zich met?");
q.NewAnswer("Zeekomkommers en lamsoren.",false);
q.NewAnswer("Alles wat hij in het water te pakken kan krijgen.",false);
q.NewAnswer("Algen.",true);
q.NewAnswer("Kleine inktvisjes en garnalen.",false);
q = gQuestionList.NewQuestion("Wat is de grootste Agamensoort?");
q.NewAnswer("Soa soa (Hydrosaurus amboinensis).",true);
q.NewAnswer("Kraaghagedis (Chlamydosaurus kingii).",false);
q.NewAnswer("Vlinderagame (Leiolepis belliana).",false);
q.NewAnswer("Lake Eyre Agame (Tympanocryptis maculosa).",false);
q = gQuestionList.NewQuestion("Vertegenwoordigers van het genus Draco vallen op doordat...");
q.NewAnswer("Ze een soort vleugels hebben en hiermee lange glijvluchten kunnen maken.",true);
q.NewAnswer("Ze een soort \"rook\" kunnen uitademen als ze zich bedreigd voelen.",false);
q.NewAnswer("Ze door hun enorme afmeting model hebben gestaan voor de sprookjesdraken.",false);
q.NewAnswer("Ze heel lange achterpoten hebben en heel kleine voorpoten.",false);
q = gQuestionList.NewQuestion("De skink Prasinohaema flavipes van Papua-Nieuw Guinea heeft...");
q.NewAnswer("Slechts twee poten.",false);
q.NewAnswer("Een lichtgevende staart.",false);
q.NewAnswer("Groen bloed.",true);
q.NewAnswer("Twee hoorntjes op zijn kop.",false);
q = gQuestionList.NewQuestion("De Florida-Zandskink (Neoseps reynoldsi) uit Florida heeft zich aangepast aan een leven dat zich grotendeels onder de grond afspeelt. Welke aanpassingen zijn dat?");
q.NewAnswer("De kleine, nauwelijks zichtbare voorpootjes hebben slechts één teen die in een gleuf kan worden opgeborgen. Aan de achterpoten zitten slechts twee tenen per poot. Hierdoor kan hij soepel door het zand glijden.",true);
q.NewAnswer("De vorm van de kop is zo scherp als een pasgeslepen potlood en op die manier kan hij, in combinatie met zijn sterke poten, zich snel ingraven.",false);
q.NewAnswer("De ogen staan op een soort verhogingen waardoor ze, gelegen onder het zandoppervlak, boven het zand kunnen loeren op prooi. Ongeveer zoals een krokodil in het water met de ogen boven het wateroppervlak uitsteekt.",false);
q.NewAnswer("De voorpoten hebben zich ontwikkeld tot grote, spadevormige ledematen waarmee ze goed kunnen graven. De achterpoten zijn volledig verdwenen.",false);
q = gQuestionList.NewQuestion("Sommige soorten van de Nachthagedissen (Xantusiidae) wijken af van alle andere hagedissensoorten. Op welke manier?");
q.NewAnswer("Ze zijn vnl. 's nachts aktief terwijl de overige hagedissen overdag aktief zijn.",false);
q.NewAnswer("Ze zijn vivipaar. D.w.z. dat de jongen via een placenta in het moederdier worden gevoed, net als bij zoogdieren.",true);
q.NewAnswer("De eieren die deze soorten leggen komen pas uit na 9 - 12 maanden. Opmerkelijk voor zulke kleine (12-15 cm) hagedissen.",false);
q.NewAnswer("Door hun nachtelijke levenswijze zijn hun ogen totaal weg-geëvolueerd.",false);
q = gQuestionList.NewQuestion("Enkele soorten van de Renhagedissen (Cnemidophorus), evenals o.a. enkele soorten van de Halsbandhagedissen (Lacerta) planten zich op de volgende wijze voort...");
q.NewAnswer("Ze leggen slechts 1 ei per jaar en broeden dat dan zelf uit.",false);
q.NewAnswer("Ze leggen soms meer dan 100 eieren per vrouw per jaar.",false);
q.NewAnswer("De vrouwtjes leggen hun eieren in een hol waarna de mannen de eieren bevruchten. ",false);
q.NewAnswer("Ze planten zich voort zonder dat er mannen aan te pas komen.",true);
q = gQuestionList.NewQuestion("Wat is een Scheltopusik?");
q.NewAnswer("Een miniscuul kleine gekkosoort die een \"schel\" geluid produceert als hij zich bedreigd voelt.",false);
q.NewAnswer("Een ruim 130 cm lang wordende, pootloze hagedis die o.a. in Europa leeft.",true);
q.NewAnswer("Een ca. 40 cm lang wordende hagedis die alleen op het eiland Madeira voorkomt en nergens anders in de wereld.",false);
q.NewAnswer("Een levendbarende hagedissensoort uit de Scandinavische landen.",false);
q = gQuestionList.NewQuestion("Hoeveel hagedissensoorten zijn inheems in Nederland?");
q.NewAnswer("3",false);
q.NewAnswer("4",true);
q.NewAnswer("5",false);
q.NewAnswer("6",false);
q = gQuestionList.NewQuestion("De laatste vraag! Weliswaar zijn de Brughagedissen (Sphenodon species) geen echte hagedissen, maar de enige vertegenwoordigers van de orde Rhynchocephalia. Men beschouwt ze als \"levende fossielen\". Een opvallend kenmerk van deze dieren is...");
q.NewAnswer("Ze leven uitsluitend op plekken waar de luchtvochtigheid minder dan 20% is.",false);
q.NewAnswer("Ze leven uitsluitend in gebieden in Rusland waar de winters langer duren dan de zomers.",false);
q.NewAnswer("Ze voelen zich het prettigst bij een omgevingstemperatuur van ca. 12 graden Celsius.",true);
q.NewAnswer("Ze zijn binnen vier weken na de geboorte al geslachtsrijp en in staat zich voort te planten.",false);



// <-- Quiz Source End 
