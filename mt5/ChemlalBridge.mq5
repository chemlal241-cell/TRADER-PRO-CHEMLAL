//+------------------------------------------------------------------+
//|                                             ChemlalBridge.mq5    |
//| Sends XM MT5 XAUUSD quotes to TRADER PRO CHEMLAL.                 |
//| No trading functions: this EA only transmits market quotes.       |
//+------------------------------------------------------------------+
#property strict
#property version "1.10"
input string InpEndpoint = "https://traderprochemlal-nine.vercel.app/api/xm-quote";
input string InpBridgeToken = ""; // Paste the same secret configured in Vercel
input string InpSymbol = "";      // Blank = chart symbol; or enter broker gold symbol
input int InpIntervalSeconds = 1;
string symbolToUse;
long lastTickTimeMsc = 0;

int OnInit()
{
   symbolToUse = (InpSymbol == "" ? _Symbol : InpSymbol);
   if(InpBridgeToken == "")
   {
      Print("ChemlalBridge: set InpBridgeToken before starting.");
      return INIT_PARAMETERS_INCORRECT;
   }
   if(!SymbolSelect(symbolToUse, true))
   {
      Print("ChemlalBridge: cannot select symbol ", symbolToUse);
      return INIT_FAILED;
   }
   EventSetTimer(MathMax(1, InpIntervalSeconds));
   SendQuote();
   Print("ChemlalBridge ready for ", symbolToUse, ". No orders will be placed.");
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTick()
{
   SendQuote();
}

void OnTimer()
{
   SendQuote();
}

void SendQuote()
{
   MqlTick tick;
   if(!SymbolInfoTick(symbolToUse, tick) || tick.bid <= 0 || tick.ask < tick.bid)
      return;
   if(tick.time_msc == lastTickTimeMsc)
      return;

   long stamp = (tick.time_msc > 0 ? tick.time_msc : (long)TimeCurrent() * 1000);
   string payload = StringFormat(
      "{\"symbol\":\"%s\",\"bid\":%s,\"ask\":%s,\"time\":%I64d}",
      symbolToUse,
      DoubleToString(tick.bid, (int)SymbolInfoInteger(symbolToUse, SYMBOL_DIGITS)),
      DoubleToString(tick.ask, (int)SymbolInfoInteger(symbolToUse, SYMBOL_DIGITS)),
      stamp
   );

   char post[];
   int copied = StringToCharArray(payload, post, 0, WHOLE_ARRAY, CP_UTF8);
   if(copied > 0)
      ArrayResize(post, copied - 1); // remove terminating null byte

   char result[];
   string resultHeaders;
   string headers = "Content-Type: application/json\r\nX-Bridge-Token: " + InpBridgeToken + "\r\n";
   ResetLastError();
   int status = WebRequest("POST", InpEndpoint, headers, 5000, post, result, resultHeaders);

   if(status == 200)
   {
      lastTickTimeMsc = tick.time_msc;
      Print("ChemlalBridge: quote sent ", symbolToUse,
            " Bid=", DoubleToString(tick.bid, 2),
            " Ask=", DoubleToString(tick.ask, 2));
   }
   else
   {
      Print("ChemlalBridge WebRequest failed. HTTP=", status,
            " MT5 error=", GetLastError(),
            ". Check MT5 WebRequest allowed URL and Vercel/Supabase settings.");
   }
}
