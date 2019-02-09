function getHTML5(data)
{
	html="";
	html=html+"<html>\n";
	html=html+"<head>\n";
	html=html+"<style>\n";
	html=html+"table {width: 60%;margin: auto;}table, th, td { border: 1px solid black;}\n";
	html=html+"</style>\n";
	html=html+"</head>\n";
	html=html+"<body>\n";
	for(i=0;i<data.length;i++)
	{
		html=html+"<h1 itemtype=\" \" >"+data[i].titlu+"</h1>\n";
		html=html+"<h2>"+data[i].organizatorName+"</h2>\n";
		participants=data[i].participants;
		if(participants!=undefined)
		{
			html=html+"<tr><th>Name</th><th>Grade</th><th>Feedback</th></tr>\n";
			for(j=0;j<participants.length;j++)
			{
				html=html+"<tr>\n";
				html=html+"<td>"+participants[j].name+"</td>\n";
				html=html+"<td>"+participants[j].grade+"</td>\n";
				html=html+"<td>"+participants[j].feedback+"</td>\n";
				html=html+"</tr>\n";
			}
		}
	}
	html=html+"</body>\n";
	html=html+"</html>\n";
	return html;
}