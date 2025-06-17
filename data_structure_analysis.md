
The user has provided a detailed breakdown of the data points for the investment plan projects. I need to structure this information into a suitable format for the dashboard. A JSON structure would be ideal for this, as it's easily consumable by JavaScript for dynamic rendering and analysis.

Here's a proposed JSON structure based on the user's requirements:

```json
[
  {
    "السنة": "",
    "الحي": "",
    "البرنامج الرئيسي": "",
    "البرنامج الفرعي": "",
    "المشروع الرئيسي": "",
    "المشروع الفرعى": "",
    "مصدر التمويل": "",
    "الاجمالي": 0,
    "المكون العينى": {
      "أرض": 0,
      "تشييدات": 0,
      "آلات ومعدات": 0,
      "عدد وأدوات": 0,
      "وسائل نقل": 0,
      "وسائل انتقال": 0,
      "أثاث وتجهيزات مكتبية": 0,
      "أبحاث ودراسات": 0
    },
    "الاجمالي_المكون_العيني": 0
  }
]
```

I will now create a sample `data.json` file with some dummy data based on this structure.

