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
from google.appengine.ext import blobstore
from google.appengine.ext import db
from google.appengine.api import mail
from google.appengine.ext.webapp import blobstore_handlers

import barcode

class Ticket(db.Model):
    email = db.EmailProperty()
    used = db.BooleanProperty()
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
                    (ticket.email, ticket.key().name(), ticket.used, ticket.time))
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
 Top Text: <textarea name="blurb_top" style="
 width: inherit;
 "></textarea>
 <br>
 Middle Text: <textarea name="blurb_mid" style="
 width: inherit;
 "></textarea>
 <br>
 Bottom Text: <textarea name="blurb_bot" style="
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
            if Ticket.all().count(1):
                currMax = Ticket.all().order('-key').get().key().id() + 1*10**mm
            else:
                currMax = n*10**(p-nn)+m
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
        numDigits = cgi.escape(self.request.get('numberDigits'))
        leading = cgi.escape(self.request.get('leadingDigits'))
        trailing = cgi.escape(self.request.get('trailingDigits'))
        rand = cgi.escape(self.request.get('checkRandom'))
        numTickets = int(cgi.escape(self.request.get('numTic')))
        email = cgi.escape(self.request.get('email'))

        #seat numbers not implemented
        for i in range (numTickets):
            ticketNum = str(self.genTicketNum(numDigits,leading,trailing,rand))
            Ticket(key_name=ticketNum, email=email, used=False).put()
            self.sendEmail(email, ticketNum)

        self.response.write("<html><body>hello</body></html>")
        self.response.out.write("""
            <html><body>Your ticket request has been approved.<br>
            Please check your email for a printable ticket. <br>
            Thank you. 
            """)
        self.response.out.write("</body></html>")

######################################################################
## Photo uploader and retriever begin
######################################################################
 
class BackgroundPhoto(db.Model):
    name = db.StringProperty()
    blob_key = blobstore.BlobReferenceProperty()
 
class PhotoUploadFormHandler(webapp2.RequestHandler):
    def get(self):
        upload_url = blobstore.create_upload_url('/upload')
        self.response.out.write('<html><body>');
        self.response.out.write('<form action="%s" method="POST" enctype="multipart/form-data">' % upload_url)
        self.response.out.write('''Upload File: <input type="text" name="name"><input type="file" name="file"><br> <input type="submit"
        name="submit" value="Submit"> </form></body></html>''')
 
class PhotoUploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        try:
            fileName = self.get_uploads()[0]
            upload = self.get_uploads()[1]
            user_photo = UserPhoto(name = fileName,
                                   blob_key=upload.key())
            db.put(user_photo)
        except:
            self.redirect('/upload_failure.html')
 
class PhotoObtainer():
    def get(self, resource):
        resource = str(urllib.unquote(resource))
        blob_info = blobstore.BlobInfo.get(resource)
        return blob_info
 
######################################################################
## Photo uploader and retriever end
######################################################################
 
app = webapp2.WSGIApplication([('/', MainHandler),
    ('/submitBarcode.html', TicketCheckingHandler),
    ('/upload', PhotoUploadHandler),
    ('/background', PhotoUploadFormHandler),
    ('/sign', TicketHandler)], 
    debug=True)
