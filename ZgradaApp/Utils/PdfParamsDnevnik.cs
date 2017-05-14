using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ZgradaApp
{
    public class PdfParamsDnevnik
    {
        public int zgradaId { get; set; }
        public int godina { get; set; }
        public List<int> mjeseci { get; set; }
    }
}