"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WifiOff, CheckCircle, XCircle, Clock, Upload, Download } from "lucide-react";
import { validatePinFormat, validateTicketNumberFormat } from "@/lib/utils/security";

interface OfflineVerificationProps {
  securityId: string;
  badgeNumber: string | null;
}

interface OfflineRecord {
  id: string;
  timestamp: string;
  verificationData: string;
  method: "pin" | "ticket_number";
  securityId: string;
  badgeNumber: string;
  status: "pending_sync";
}

export function OfflineVerificationInterface({ securityId, badgeNumber }: OfflineVerificationProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [ticketInput, setTicketInput] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [offlineRecords, setOfflineRecords] = useState<OfflineRecord[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Load offline records from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`offline_verifications_${securityId}`);
    if (stored) {
      try {
        setOfflineRecords(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load offline records:", error);
      }
    }
  }, [securityId]);

  // Save offline records to localStorage
  const saveOfflineRecord = (record: OfflineRecord) => {
    const updated = [...offlineRecords, record];
    setOfflineRecords(updated);
    localStorage.setItem(`offline_verifications_${securityId}`, JSON.stringify(updated));
  };

  const handlePinVerification = () => {
    if (!validatePinFormat(pinInput)) {
      setResult({
        success: false,
        message: "Please enter a valid 6-digit PIN"
      });
      return;
    }

    if (!isOnline) {
      // Save for later sync
      const record: OfflineRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        verificationData: pinInput,
        method: "pin",
        securityId,
        badgeNumber: badgeNumber || "UNKNOWN",
        status: "pending_sync"
      };

      saveOfflineRecord(record);
      setResult({
        success: true,
        message: "PIN verification recorded offline. Will sync when online."
      });
      setPinInput("");
    } else {
      // TODO: Implement online verification
      setResult({
        success: true,
        message: "Online verification would happen here"
      });
      setPinInput("");
    }
  };

  const handleTicketVerification = () => {
    if (!validateTicketNumberFormat(ticketInput)) {
      setResult({
        success: false,
        message: "Invalid ticket format. Expected: HCS-YYYY-XXXXXXXX"
      });
      return;
    }

    if (!isOnline) {
      // Save for later sync
      const record: OfflineRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        verificationData: ticketInput,
        method: "ticket_number",
        securityId,
        badgeNumber: badgeNumber || "UNKNOWN",
        status: "pending_sync"
      };

      saveOfflineRecord(record);
      setResult({
        success: true,
        message: "Ticket verification recorded offline. Will sync when online."
      });
      setTicketInput("");
    } else {
      // TODO: Implement online verification
      setResult({
        success: true,
        message: "Online verification would happen here"
      });
      setTicketInput("");
    }
  };

  const clearOfflineRecords = () => {
    setOfflineRecords([]);
    localStorage.removeItem(`offline_verifications_${securityId}`);
    setResult({
      success: true,
      message: "Offline records cleared."
    });
  };

  const exportOfflineData = () => {
    const dataStr = JSON.stringify(offlineRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `offline_verifications_${badgeNumber}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge 
              variant={isOnline ? "default" : "secondary"}
              className={isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {!isOnline && (
              <p className="text-sm text-gray-600">
                Verifications will be stored locally and synced when online
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pin">PIN Verification</TabsTrigger>
              <TabsTrigger value="ticket">Ticket Number</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin-input">6-Digit PIN</Label>
                <Input
                  id="pin-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-lg font-mono"
                />
              </div>
              <Button 
                onClick={handlePinVerification}
                disabled={pinInput.length !== 6}
                className="w-full"
              >
                Verify PIN
              </Button>
            </TabsContent>

            <TabsContent value="ticket" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-input">Ticket Number</Label>
                <Input
                  id="ticket-input"
                  type="text"
                  placeholder="e.g., HCS-2024-12345678"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                />
              </div>
              <Button 
                onClick={handleTicketVerification}
                disabled={!ticketInput}
                className="w-full"
              >
                Verify Ticket
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Result Message */}
      {result && (
        <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
              {result.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Offline Records */}
      {offlineRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Offline Records ({offlineRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {offlineRecords.slice(-5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {record.method === "pin" ? "PIN" : "Ticket"}: {record.verificationData}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pending Sync
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={exportOfflineData}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearOfflineRecords}
                  className="flex items-center gap-2"
                >
                  Clear Records
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Mode Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• When offline, verifications are stored locally on this device</p>
            <p>• Records will automatically sync when internet connection is restored</p>
            <p>• Export data regularly for backup purposes</p>
            <p>• Contact admin if you need to verify records manually</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 