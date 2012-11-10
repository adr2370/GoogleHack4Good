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
import datetime
import random
import StringIO
import base64
from google.appengine.ext import db
from google.appengine.api import mail

import barcode
import photoupload

class Ticket(db.Model):
    email = db.EmailProperty()
    activated = db.BooleanProperty()
    time = db.DateTimeProperty()

class TicketCheckingHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")

        barcode = self.request.get('barcode')
        ticket = Ticket.get_by_key_name(barcode)

        self.response.out.write('<html><body>')
        if not ticket:
            # empty query
            self.response.out.write('1')

        elif not ticket.activated:
            ticket.activated = True
            ticket.time = datetime.datetime.now()
            ticket.put()
            self.response.out.write('0')

        else:
            self.response.out.write(ticket.time) 
        self.response.out.write('</body></html>')

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.out.write("""<html><body>
        <img src="http://www.ashanet.org/graphics/asha_logo.png" style="
        width: 400px;
        margin-left: auto;
        margin-right: auto;
        display: block;
        ">
        <form action="/sign" method="get" style="
        width: 400px;
        margin-left: auto;
        margin-right: auto;
        ">
 Background picture:
 <select name="picture" style="float: right;">
 """)
        for photo in photoupload.BackgroundPhoto.all():
            self.response.out.write("<option value=%s>%s</option>" % (photo.key().name(), photo.key().name()))

        self.response.out.write("""
        </select>
        <a href="/background">Upload picture</a>
 <hr>
 Custom text blurb: <textarea name="blurb" style="
 width: inherit;
 "></textarea>
 <hr>
 Ticket category: <input name="ticket_category" style="
 float: right;
 margin-bottom: 10px;
 "><hr style="
 clear: both;
 ">Number of Digits: <input name="numberDigits" style="
 float: right;
 margin-bottom: 10px;
 "><hr style="
 clear: both;
 ">Leading Digits: <input name="leadingDigits" style="
 float: right;
 margin-bottom: 10px;
 ">
 <hr style="
 clear: both;
 ">Trailing Digits: <input name="trailingDigits" style="
 float: right;
 margin-bottom: 10px;
 ">
 
 <hr style="
 clear: both;
 ">
 Random Barcodes: <input type="checkbox" name="checkRandom" style="float:right; margin-bottom:10px;">
 <hr style="clear:both;">
 
 
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
        <input type="submit" value="Submit"></form></body>
        </html>""")

class TicketHandler(webapp2.RequestHandler):
    def genTicketNum(self, numDigits, leading, trailing, rand):
        #expect event number to be 2 digits
        #query database for event information based on event number
        n = int(leading)
        m = int(trailing)
        p = int(numDigits)
        nn = len(leading)
        mm = len(trailing)
        if nn+mm > p:
            raise Exception("Snakes everywhere!!")
        ticketNum = 0
        if rand:
            while True:
                ticketNum = n
                digitsLeft=p-mm-nn
                for i in range(digitsLeft):
                    ticketNum = ticketNum*10+random.randint(0,9)
                ticketNum = ticketNum*10**mm+m
                if not Ticket.get_by_id(ticketNum):
                    break
        else:
            ticket_nums = [int(ticket.key().name()) for ticket in Ticket.all() if 
                    ticket.key().name().startswith(leading) and 
                    ticket.key().name().endswith(trailing)
                    and len(ticket.key().name()) == p]
            if ticket_nums:
                ticketNum = max(ticket_nums) + 10 ** mm
            else:
                ticketNum = n
                digitsLeft=p-mm-nn
                ticketNum = ticketNum*10**digitsLeft
                ticketNum = ticketNum*10**mm+m
        return ticketNum

    def sendEmail(self, email, ticketNum, blurb): 
        if not mail.is_email_valid(email): 
            self.response.write("<html><body>hello</body></html>")
            #prompt user to enter a valid address
        else:
            message = mail.EmailMessage(sender="Ji Huang <jihuang92@gmail.com>",
                    subject="Your Asha for Education ticket purchase was successful!")

            message.to = email

            message.body = """
            Hello, 

            Your request for a ticket with Asha for Education has been approved. 
            Please print the attached ticket and bring it with you to the event. 
            
            Thank you.
            
            Asha for Education
            """

            # Generate image string
            x = barcode.generate(ticketNum, blurb)
            output = StringIO.StringIO()
            x.save(output, "PNG")
            message.attachments = [('ticket.png', output.getvalue())]
            output.close()

            message.send()

    def get(self):
        numDigits = cgi.escape(self.request.get('numberDigits'))
        leading = cgi.escape(self.request.get('leadingDigits'))
        trailing = cgi.escape(self.request.get('trailingDigits'))
        rand = cgi.escape(self.request.get('checkRandom'))
        numTickets = int(cgi.escape(self.request.get('numTic')))
        email = cgi.escape(self.request.get('email'))
        blurb = cgi.escape(self.request.get('blurb'))

        #seat numbers not implemented
        for i in range (numTickets):
            ticketNum = str(self.genTicketNum(numDigits,leading,trailing,rand))
            Ticket(key_name=ticketNum, email=email, activated=False).put()
            self.sendEmail(email, ticketNum, blurb)

        self.response.out.write("""
            <html><body>Your ticket request has been approved.<br>
            Please check your email for a printable ticket. <br>
            Thank you. 
            <form action="/" method="GET">
            <input type="submit" value="Back">
            </form>
            </body></html>
            """)

app = webapp2.WSGIApplication([('/', MainHandler),
    ('/submitBarcode.html', TicketCheckingHandler),
    ('/upload', photoupload.PhotoUploadHandler),
    ('/background', photoupload.PhotoUploadFormHandler),
    ('/sign', TicketHandler)], 
    debug=True)
