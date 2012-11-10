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
from google.appengine.ext import db

class Ticket(db.Model):
    email = db.EmailProperty()
    ticket_number = db.StringProperty()
    used = db.BooleanProperty()
    time = db.DateTimeProperty()

class TicketCheckingHandler(webapp2.RequestHandler):
    def get(self):
        barcode = self.request.get('barcode')
        tickets = db.GqlQuery("SELECT * FROM Ticket WHERE TICKET_NUMBER=%s" % 
                barcode)

        self.response.write('<html><body>')
        tickets = [ticket for ticket in tickets]
        if not tickets:
            # empty query
            self.response.write('0')

        else:
            ticket = tickets[0]
            if not ticket.used:
                ticket.time = datetime.datetime.now()
                self.response.write('1')

            else:
                self.response.write(ticket.time) 
        self.response.write('</body></html>')

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('<html><body>')
        tickets = db.GqlQuery("")

        if not tickets:
            return

        self.response.write('<table>')
        for ticket in tickets:
            self.response.write(
                    '<tr><td>%s</td><td>%s</td></tr>' % 
                    (ticket.email, ticket.ticket_number))
        self.response.write('</table>')

        self.response.out.write("""
        <form action="/add" method="post">
        Background picture: <input type="file" name="picture">
        <hr>
        Custom text blurb:
        <br>
        Top: <input name="blurb_top">
        <br>
        Mid: <input name="blurb_mid">
        <br>
        Bot: <input name="blurb_bot">
        <hr>
        Ticket category: <input name="ticket_category">
        <hr>
        Ticket number format: <input name="ticket_format">
        <hr>
        Number of tickets to be generated: <input name="num_tickets">
        <hr>
        Email address to which tickets should be sent: <input name="email">
        <input type="submit" value="Submit"></form>
        </body>
        </html>""")

class Add(webapp2.RequestHandler):
    def post(self):
        email = self.request.get('email')
        ticket_number = self.request.get('ticket_number')
        Ticket(email=email, ticket_number=ticket_number).put()
        self.redirect('/')

app = webapp2.WSGIApplication([('/', MainHandler),
    ('/add', Add),
    ('/submitBarcode.html', TicketCheckingHandler)], 
    debug=True)
