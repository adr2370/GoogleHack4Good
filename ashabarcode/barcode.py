import sys
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw
import main
import urllib2
import StringIO

import photoupload

def test():
   """ Execute all tests """
   testWithChecksum()
   testWithoutChecksum()
   testImage()

def centerAlign(picWidth, text, tinyfont):
   W, H = (1260,300)
   im = Image.new("RGBA",(W,H),"yellow")
   draw = ImageDraw.Draw(im) 
   w, h = draw.textsize(text)
   return (W-w)/2

def generate(codeNum, date, imageName = "template2"):
#get the barcode online
   linkPrefix = "http://www.barcodesinc.com/generator/image.php?code="
   linkSuffix = "&style=197&type=C128B&width=300&height=100&xres=1&font=3"
   u = urllib2.urlopen(linkPrefix + codeNum + linkSuffix)
   data = u.read()
   fileImg = StringIO.StringIO(data)
   img = Image.open(fileImg)
   font = ImageFont.truetype("DejaVuSans.ttf",45)
   smallfont = ImageFont.truetype("DejaVuSans.ttf",20)
   tinyfont = ImageFont.truetype("DejaVuSans.ttf",15)
   medianfont = ImageFont.truetype("DejaVuSans.ttf",40)
   img_w,img_h=img.size
   img = img.resize((img_w*2, img_h*2))
   fileImg = StringIO.StringIO(photoupload.getPhoto(imageName))
   background = Image.open(fileImg)
   #background = Image.open(photoupload.getPhoto(imageName))
   background.resize((1440, 900));
   #background = Image.new('RGBA', (1440,900), (255, 255, 255, 255))
   bg_w,bg_h=background.size
   blackBanner = Image.new('RGBA', (1440, 80), (0,0,0,0))
   blueBanner = Image.new('RGB', (1440 - 2 * (bg_w - img_w)/5, 80), (30,144,255))

   firstStatement = """PLEASE CHECK THAT THE EVENT DATE MATCHES THE ONE ON THE TICKET.\
TICKET ONLY VALID ON STATED DAY"""
   secondStatement = """Thank you for making a difference in the lives of children by participating In this event"""
   thirdStatement = """Net proceeds go towards funding education of underpriviledged children"""
   fourthStatement = """Asha for education and Asha Stanford are not responsible for any injury, \
damage, or loss suffered by a participant during this event."""
   fifthStatement = """We reserve the right to change the program before & during this event."""
   sixthStatement = """We reserve the right to cancel or change the dates and venue of the event in \
case of inclement weather"""
   seventhStatement = """We reserve the right to bar any persons from the event grounds for unruly behavior"""
   eighthStatement = """We reserve the right to use photographs and videos shot at the venue for \
archival and future promotional use"""
   ninethStatement = """No alcohol allowed at the event. Persons found carrying alcoholic beverages \
will be banned from entering the ground."""

   offsetBarcode=(2*(bg_w-img_w)/5 - 200,4*(bg_h-img_h)/5)
   offsetCodeNum=(centerAlign(1440, codeNum, medianfont),4*(bg_h-img_h)/5 + 160)
   offsetBlackBanner = (0, 0)
   offsetBlueBanner=((bg_w-img_w)/5,(bg_h-img_h)/5)
   offsetBlueBannerText = (centerAlign(1440, date, medianfont),(bg_h-img_h)/5 + 10)
   offsetFirstStatement = (centerAlign(1440, firstStatement, tinyfont),(bg_h-img_h)/5 + 100)
   offsetSecondStatement = (centerAlign(1440, secondStatement, tinyfont),(bg_h-img_h)/5 + 130)
   offsetThirdStatement = (centerAlign(1440, thirdStatement, tinyfont),(bg_h-img_h)/5 + 160)
   offsetFourthStatement = (centerAlign(1440, fourthStatement, tinyfont),(bg_h-img_h)/5 + 190)
   offsetFifthStatement = (centerAlign(1440, fifthStatement, tinyfont),(bg_h-img_h)/5 + 220)
   offsetSixthStatement = (centerAlign(1440, sixthStatement, tinyfont),(bg_h-img_h)/5 + 250)
   offsetSeventhStatement = (centerAlign(1440, seventhStatement, tinyfont),(bg_h-img_h)/5 + 280)
   offsetEighthStatement = (centerAlign(1440, eighthStatement, tinyfont),(bg_h-img_h)/5 + 310)
   offsetNinethStatement = (centerAlign(1440, ninethStatement, tinyfont),(bg_h-img_h)/5 + 340)
   offsetPleasePrint=((bg_w-img_w)/5,(bg_h-img_h)/5-80)
   offsetBannerText =  (25, 20)
   background.paste(img,offsetBarcode)
   background.paste(blackBanner , offsetBlackBanner)
   background.paste(blueBanner, offsetBlueBanner)
   
   draw = ImageDraw.Draw(background)
   draw.text( offsetBannerText ,"THIS IS YOUR ELECTRONIC TICKET. DUPLICATION PROHIBITED",
             fill = "white" ,font = font)
   draw.text( offsetPleasePrint,"""PLEASE PRINT THIS PAGE AND BRING IT WITH YOU FOR ENTRANCE TO"""
              """ASHA STANDFORD HOLI 2012""",
             fill = "black" , font = smallfont)
   draw.text( offsetBlueBannerText,date, "black",medianfont)
   draw.text( offsetFirstStatement ,firstStatement ,"black",tinyfont)
   draw.text( offsetSecondStatement ,secondStatement ,"black",tinyfont)
   draw.text( offsetThirdStatement ,thirdStatement ,"black",tinyfont)
   draw.text( offsetFourthStatement ,fourthStatement ,"black",tinyfont)
   draw.text( offsetFifthStatement ,fifthStatement,"black",tinyfont)
   draw.text( offsetSixthStatement ,sixthStatement ,"black",tinyfont)
   draw.text( offsetSeventhStatement ,seventhStatement ,"black",tinyfont)
   draw.text( offsetEighthStatement ,eighthStatement ,"black",tinyfont)
   draw.text( offsetNinethStatement ,ninethStatement ,"black",tinyfont)
   #draw.text( offsetCodeNum,codeNum,"black",medianfont)
#  background.save('out.png')
   return background;

if __name__ == "__main__":
   generate ("564513348786312", "Saturday")
