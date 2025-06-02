from flask import Flask, render_template, request, send_from_directory
from docx import Document
import docxedit
from doc2pdf import convert
import aspose.words as aw
app = Flask(__name__)


template1 = ['en00', 'noe00',  'dd1', 'mm1', 'dd2', 'mm2']
template2 = ["lg00", 'name1', 'name2', 'name3', "ls00"]
template3 = ["lg00", 'name1', "ls00", "teacher00"]


Lab_GroupsDLD = [
    [
        [],
        ["01", "Anirban Roy Sourov (32)", "Kabya Mithun Saha (16)",
         "Faisal Ahmad (54)", "B"],
        ["02", "Md. Toha Hossain (30)", "Md. Saif Mahamud (34)",
            "Mohammad. Sajid Al Rafi Hasan (62)", "B"],
        ["03", "Farzana Tasnim (14)", "Amina Islam (36)",
         "Md. Nuruzzaman (56)", "B"],
        ["04", "Md. Abu Horaira (26)", "Md.Adib Ahsan (60)",
            "Shraban Karmoker Avi (44)", "B"],
        ["05", "Mominul Islam Hemal (40)", "Talha Jubair Siam (52)",
            "Rezaunnabi Ruhan (58)", "B"],
        ["06", "Shahriar Hossen Fahim (12)", "Ashesh Bar (18)",
            "Hasibul Islam Sifat (42)", "B"],
        ["07", "Jannatul Ferdousi (08)", "Md. Nuran Nahadi Islam (38)",
            "Abir Hasan (85)", "B"],
        ["08", "Ashraful Alam (02)", "Md. Tauseef - Ur - Rahman (24)",
            "Faiaz Mahmud (46)", "B"],
        ["09", "Abrar Fahyaz (06)", "Nafis Shyan (10)",
         "Tamzid Bin Tariq (48)", "B"],
        ["10", "Marufur Rahman Mithu (19)",
            "Abdullah al arman emon (50)", "Tonmoy (22)", "B"],
        ["11", "Tawyabul Islam Tamim (04)", "Md. Shahriar Kabir (20)",
            "Ovijit Chandra Balo (28)", "B"]
    ],
    [
        [],
        ["01", "Anindya Kundu (09)", "Faria Yasmin (21)",
         "Rubaiya Tarannum Mrittika (49)", "A"],
        ["02", "Sumaiya Tabassum (29)", "Asuma Bhuiyan (63)",
            "Irin Sultana (41)", "A"],
        ["03", "Tanzila Khan (25)", "Muhaiminul Islam Ninad (43)",
            "Fayek Ahmed Rahat (57)", "A"],
        ["04", "Tazkia Malik (07)", "Taif Ahmed Turjo (45)",
            "Homaira Zahin Autoshy (47)", "A"],
        ["05", "Papry Rahman (01)", "Md. Sadek Hossain Asif (15)",
            "Sharmila Surovi Pushpita (39)", "A"],
        ["06", "Nafiul Alim Adeeb (23)", "Abu Kawser (33)",
            "Amio Rashid (59)", "A"],
        ["07", "Al Habib (17)", "Ruhul Amin (27)",
            "Syed Naimul Islam (37)", "A"],
        ["08", "Mehedi Hasan Sakib (13)", "Akash Bishwas (65)",
            "Rafiul Islam Sagor (55)", "A"],
        ["09", "Yuki Bhuiyan (64)", "Mahmud Hasan Walid (51)",
            "Md. Khairul Mia (Re-admission)", "A"],
        ["10", "Sakib Hossain (05)", "Manobendra Biswas (35)",
            "Tamim Dewan Zihad (53)", "A"],
        ["11", "Tasnim Kabir Sadik (03)", "Showkoth Osman Shova (11)",
            "Nahin Ehsan Nilav (31)", "A"]
    ]
]
Lab_DataDLD = [
    [],
    ["01",
        "Experiment on Verifying Basic Logic Gates (AND, OR, NOT)", "20", "7", "27", "7"],
    ["02", "Implementation of basic gates using Universal Gate", "27", "7", "3", "8"],
    ["03", "Derive logical expression from truth table simplifying them and implementation of the simplified expression Using Basic Logic gates", "__", "__", "__", "__"],
    ["04",
        "Simplifying the logic expression derived from the truth table using Karnaugh Map (K-Map)", "__", "__", "__", "__"],
    ["05", "Implement and Verify the output of a half adder and full adder using logic gates",
        "__", "__", "__", "__"],
    ["06", "Implementation and verification of the 4-1 Multiplexer Circuit using logic gates",
        "__", "__", "__", "__"],
    ["07", "Design and implement a 1-4 Demultiplexer using basic gates",
        "__", "__", "__", "__"],
    ["08", "Design and implementation of 8 to 3 Priority encoder", "__", "__", "__", "__"],
    ["09", "Implementation of SR, JK, and D flip flop using NAND gate",
        "__", "__", "__", "__"],
    ["09", "Implementation of a 2 bit comparator using logic gates.",
        "__", "__", "__", "__"]
]


Lab_GroupsPhysics = [
    [
        [],
        ["1", "Jannatul Ferdousi (08)", "Md. Nuran Nahadi Islam (38)",
         "Faisal Ahmad (54)", "Abir Hasan (85)", "B", "Dr. S. M. Mostafa Al Mamun"],
        ["2", "Farzana Tasnim (14)", "Amina Islam (36)",
         "Habibul Islam Sifat (42)", "Md. Nuruzzaman (56)", "B", "Dr. S. M. Mostafa Al Mamun"],
        ["3", "Ashesh Bar (18)", "Md. Toha Hossain (30)",
         "Md. Saif Mahamud (34)", "Mohammad. Sajid Al Rafi Hasan (62)", "B", "Dr. S. M. Mostafa Al Mamun"],
        ["4", "Md. Abu Horaira (26)", "Md. Adib Ahsan (60)",
         "Shraban Karmoker Avi (44)", "Abdullah Al Arman Emon (50)", "B", "Dr. S. M. Mostafa Al Mamun"],
        ["5", "Shahriar Hossen Fahim (12)", "Md. Tauseef - Ur - Rahman (24)",
         "Faiaz Mahmud (46)", "Tamzid Bin Tariq (48)", "B", "Dr. S. M. Mostafa Al Mamun"],
        ["6", "Abrar Fahyaz (06)", "Nafiz Shayn (10)", "Mominul Islam Hemal (40)",
         "Talha Jubair Siam (52)", "B", "Dr. S. M. Mostafa Al Mamun"],
        ["7", "Ashraful Alam (02)", "Tawabul Islam Tamim (04)",
         "Md. Shahriar Kabir (20)", "Ovijit Chandra Balo (28)", "B", "Dr. S. M. Mostafa Al Mamun"],
        ["8", "Kabya Mithun Saha (16)", "Tonmoy Das (22)",
         "Marufur Rahman Mithu (19)", "Anirban Roy Sourov (32)", "B", "Dr. S. M. Mostafa Al Mamun"]
    ],
    [[],
     ["1", "Mehedi Hasan Sakib (13)", "Nafiul Alim Adeeb (23)",
      "Taif Ahmed Turjo (45)", "Amio Rashid (59)", "A", "Dr. Abul Kalam Azad"],
        ["2", "Papry Rahman (01)", "Tazkia Malik (07)", "Sharmila Surovi (39)",
         "Homaira Zahin (47)", "A", "Dr. Abul Kalam Azad"],
        ["3", "Md.Sadek Hossain Asif (15)", "Tanzila Khan (25)", "Muhaiminul Islam Ninad (43)",
         "Fayek Ahmed Rahat (57)", "A", "Dr. Abul Kalam Azad"],
        ["4", "Anindya Kundu (9)", "Faria Yasmin (21)", "Rubaiya Tarannum Mrittika (49)", "Showkoth Osman Shova (11)", "A", "Dr. Abul Kalam Azad"],
        ["5", "Tasnim Kabir Sadik (03)", "Sakib Hossain (05)", "Nahin Ehsan Nilav (31)",
         "Abu Kawser (33)", "A", "Dr. Abul Kalam Azad"],
        ["6", "Md. Al Habib (17)", "Ruhul Amin (27)", "Syed Naimul Islam (37)",
         "Asuma Bhuiyan (63)", "A", "Dr. Abul Kalam Azad"],
        ["7", "Sumaiya Tabassum (29)", "Mahmud Hasan Walid (51)", "Yuki Bhuiyan (64)",
         "Md. Khairul Mia (Re-admission)", "A", "Dr. Abul Kalam Azad"],
        ["8", "NA", "NA", "NA", "NA", "A", "Dr. Abul Kalam Azad"]]
]
Lab_DataPhysics = [
    [],
    ["01", "Determine The Angle Of A Prism And The Refractive Index Of The Material Of A Prism",
        "__", "__", "__", "__"],
    ["02", "Determine The Wavelength Of Various Spectral Lines By A Spectrometer Using A Plane Diffraction Grating", "__", "__", "__", "__"],
    ["03", "Draw The μ vs. 1/λ² Curve To Determine The Cauchy's Constant And Also Determine The Resolving Power Of A Prism", "__", "__", "__", "__"],
    ["04", "Determine The Radius Of Curvature Of A Lens By Newton's Ring Method",
        "__", "__", "__", "__"],
    ["05", "Determine The Specific Heat Of A Liquid By The Newton's Cooling Law",
        "__", "__", "__", "__"],
    ["06", "Determination Of The Surface Tension Of Mercury And Angle Of Contact By Quincke's Method",
        "__", "__", "__", "__"]

]


@app.route("/")
@app.route("/home")
def home():
    return render_template("index.html")


@app.route("/DLD")
def DLD():
    return render_template("DLD.html")


@app.route("/Physics")
def Physics():
    return render_template("Physics.html")


@app.route("/resultDLD", methods=["POST"])
def resultDLD():
    output = request.form.to_dict()
    sec = int(output["Section"])
    lg = int(output["LabGroup"])
    en = int(output["ExpNo"])
    return render_template("resultDLD.html", lg=Lab_GroupsDLD[sec][lg], en=Lab_DataDLD[en])


@app.route("/resultPhysics", methods=["POST"])
def resultPhysics():
    output = request.form.to_dict()
    sec = int(output["Section"])
    lg = int(output["LabGroup"])
    en = int(output["ExpNo"])
    return render_template("resultPhysics.html", lg=Lab_GroupsPhysics[sec][lg], en=Lab_DataPhysics[en])


@app.route("/downloadDLD", methods=["POST"])
def downloadDLD():
    output = request.form.to_dict()
    document = Document("coverDLD.docx")
    # print(output)
    for i in range(0, len(template1)):
        docxedit.replace_string(
            document, old_string=template1[i], new_string=output[template1[i]])

    for i in range(0, len(template2)):
        docxedit.replace_string(
            document, old_string=template2[i], new_string=output[template2[i]])

    document.save("coverDLD2.docx")
    convert("coverDLD2.docx", "coverDLD.pdf")
    # ekhane edit kora lagbe  pore
    return send_from_directory("",
                               'coverDLD.pdf', as_attachment=False)


@app.route("/downloadPhysics", methods=["POST"])
def downloadPhysics():
    output = request.form.to_dict()
    document = Document("coverPhysics.docx")
    # print(output)
    for i in range(0, len(template3)):
        docxedit.replace_string(
            document, old_string=template3[i], new_string=output[template3[i]])
    for i in range(0, len(template1)):
        docxedit.replace_string(
            document, old_string=template1[i], new_string=output[template1[i]])

    document.save("coverPhysics2.docx")
    convert("coverPhysics2.docx", "coverPhysics.pdf")

    # ekhane edit kora lagbe  pore
    return send_from_directory("",
                               'coverPhysics.pdf', as_attachment=False)


if __name__ == '__main__':
    app.run()
