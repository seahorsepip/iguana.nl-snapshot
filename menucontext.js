function showToolbar()
{
// AddItem(id, text, hint, location, alternativeLocation);
// AddSubItem(idParent, text, hint, location);

	menu = new Menu();
	menu.addItem("informatieid", "Informatie", "Kijk hier voor de belangrijkste informatie...",  null, null);
	menu.addItem("zooid", "In de zoo", "Geschiedenis, nieuws, etc...",  null, null);
	menu.addItem("dierenid", "Dieren", "Dierbeschrijvingen en fotoos...",  null, null);
	menu.addItem("diversenid", "Diversen", "Spelletje, quiz, kleurplaten...",  null, null);
	menu.addItem("contactid", "Contact", "Email, telefoon, fax...",  null, null);
	
	menu.addSubItem("informatieid", "Openingstijden", "Wanneer en hoe laat is de zoo open?", "openingstijden.htm", target="mainFrame");
	menu.addSubItem("informatieid", "Entreeprijzen", "Wat kost een bezoek aan de zoo?",  "entreeprijzen.htm", target="mainFrame");
	menu.addSubItem("informatieid", "Lokatie", "Waar kunt u de zoo vinden?",  "lokatie.htm", target="mainFrame");
	
	menu.addSubItem("zooid", "Nieuws", "Het laatste nieuws...",  "nieuws.htm", target="mainFrame");
	menu.addSubItem("zooid", "Wandeling", "Een wandeling door de zoo...",  "wandeling.htm", target="mainFrame");
	menu.addSubItem("zooid", "Geschiedenis", "Het ontstaan en de hoogtepunten...",  "geschiedenis.htm", target="mainFrame");
	
	menu.addSubItem("dierenid", "Dierbeschrijvingen", "Beschrijving van enkele soorten uit de zoo...",  "dierbeschrijvingen.htm", target="mainFrame");
	menu.addSubItem("dierenid", "Foto's", "Foto`s van dieren uit de zoo...",  "fotoos.htm", target="mainFrame");
          
	
	menu.addSubItem("diversenid", "Quizzen", "Test uw kennis...",  "quiz.htm", target="mainFrame");
	menu.addSubItem("diversenid", "Kleurplaten", "Print eens een kleurplaat voor uw kind...", "kleurplaten.htm", target="mainFrame");
	
	
	menu.addSubItem("contactid", "Contact", "Email, telefoon, fax...",  "contact.htm", target="mainFrame");
	menu.addSubItem("contactid", "Links", "Allerlei interessante links...",  "links.htm", target="mainFrame");
	menu.addSubItem("contactid", "Home", "Terug naar de eerste pagina.",  "mainframe.htm", target="mainFrame");
	
	
	menu.showMenu();
}