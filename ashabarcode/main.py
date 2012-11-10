#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import cgi
import urllib
import datetime
import random
import StringIO
import base64
from google.appengine.ext import db
from google.appengine.api import mail

import barcode

class Ticket(db.Model):
    email = db.EmailProperty()
    used = db.BooleanProperty()
    time = db.DateTimeProperty()

class TicketCheckingHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")

        barcode = int(self.request.get('barcode'))
        ticket = Ticket.get_by_id(barcode)

        self.response.out.write('<html><body>')
        if not ticket:
            # empty query
            self.response.out.write('1')

        elif not ticket.used:
            ticket.used = True
            ticket.time = datetime.datetime.now()
            ticket.put()
            self.response.out.write('0')

        else:
            self.response.out.write(ticket.time) 
        self.response.out.write('</body></html>')

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('<html><body>')
        tickets = db.GqlQuery("SELECT * FROM Ticket")

        if not tickets:
            return

        self.response.write('<table>')
        for ticket in tickets:
            self.response.write(
                    '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' %
                    (ticket.email, ticket.key().id(), ticket.used, ticket.time))
        self.response.write('</table>')

        self.response.out.write("""<html><body>
        <form action="/sign" method="get" style="
width: 400px;
margin-left: auto;
margin-right: auto;
">
Background picture: <input type="file" name="picture">
<hr>
Custom text blurb:
<br>
Top: <textarea name="blurb_top" style="
width: inherit;
"></textarea>
<br>
Mid: <textarea name="blurb_mid" style="
width: inherit;
"></textarea>
<br>
Bot: <textarea name="blurb_bot" style="
width: inherit;
"></textarea>
<hr>
Ticket category: <input name="ticket_category" style="
float: right;
margin-bottom: 10px;
">
<hr style="
clear: both;
">
Ticket number format: <input name="ticket_format" style="
float: right;
margin-bottom: 10px;
">
<hr style="
clear: both;
">
Number of tickets to be generated: <input name="numTic" style="
float: right;
margin-bottom: 10px;
">
<hr style="
clear: both;
">
Email address to which tickets should be sent: <input name="email" style="
width: 335px;
">
<input type="submit" value="Submit"></form>
        </body>
        </html>""")

class TicketHandler(webapp2.RequestHandler):
    def genTicketNum(self, eventNumber):
        #expect event number to be 2 digits
        #query database for event information based on event number
        n = 3 #get from database
        nn = 0
        if n!=0:
            nn = 1 # get from database
        m = 2 #get from database
        mm = 1 #get from database
        p = 6 #get from database
        max = 999 #get from database
        rand = False; #get from database
        if n+m > p:
            raise Exception("Snakes everywhere!!")
        elif max > 10**(p-n-m+1)-1:
            raise Exception("I'm tired of snakes!!")
        ticketNum = 0
        if rand:
            while True:
                ticketNum = nn*10**(p-n)
                randNum = 0
                for i in range(p-m-n):
                    randNum = random.randint(0,9)+randNum*10
                ticketNum = randNum*10**m
                ticketNum = ticketNum+mm
                if not Ticket.get_by_id(ticketNum):
                    break
        else:
            ticketNum = nn*10**(p-n)
            currMax = Ticket.all().order('-key').get().key().id() + 1*10**m
            ticketNum = currMax
        return ticketNum

    def sendEmail(self, email, ticketNum): 
        if not mail.is_email_valid(email): 
            self.response.write("<html><body>hello</body></html>")
            #prompt user to enter a valid address
        else:
            message = mail.EmailMessage(sender="Ji Huang <jihuang92@gmail.com>",
                    subject="Your account has been approved")

            message.to = email

            message.body = """
            Dear Albert:

            Your example.com account has been approved.  You can now visit
            http://www.example.com/ and sign in using your Google Account to
            access new features.

            Please let us know if you have any questions.

            The example.com Team
            """

            # Generate image string
            x = barcode.generate(ticketNum, "asdf")
            output = StringIO.StringIO()
            x.save(output, "PNG")
            message.attachments = [('ticket.png', output.getvalue())]
            output.close()

            message.send()

    def get(self):
        eventNumber = cgi.escape(self.request.get('eventNum'))
        numTickets = int(cgi.escape(self.request.get('numTic')))
        email = cgi.escape(self.request.get('email'))

        #seat numbers not implemented
        for i in range (numTickets):
            ticketNum = self.genTicketNum(eventNumber)
            Ticket(id=ticketNum, email=email, used=False).put()
            self.sendEmail(email, str(ticketNum))

        self.response.write("<html><body>hello</body></html>")
        self.response.out.write("""
            <html><body>Your ticket request has been approved.<br>
            Please check your email for a printable ticket. <br>
            Thank you. 
            """)
        self.response.out.write("</body></html>")

app = webapp2.WSGIApplication([('/', MainHandler),
    ('/submitBarcode.html', TicketCheckingHandler),
    ('/sign', TicketHandler)], 
    debug=True)
